import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ListingDetailView from "../views/ListingDetailView";

jest.mock("../components/Navbar", () => function MockNavbar() {
  return <div data-testid="navbar">Navbar</div>;
});

jest.mock("../components/ChatModal", () => function MockChatModal({
  listingId,
  listingTitle,
  otherUserId,
  otherUserName,
  onClose,
}) {
  return (
    <div data-testid="chat-modal">
      <div>ChatModal</div>
      <div>listingId: {listingId}</div>
      <div>listingTitle: {listingTitle}</div>
      <div>otherUserId: {otherUserId}</div>
      <div>otherUserName: {otherUserName}</div>
      <button onClick={onClose}>Close Chat</button>
    </div>
  );
});

let mockUser = {
  id: "requester-1",
  email: "requester@example.com",
};

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

function LocationDisplay() {
  const location = useLocation();
  return (
    <div data-testid="location-display">
      {location.pathname}
      {location.search}
    </div>
  );
}

const baseListing = {
  id: "listing-1",
  item: {
    title: "Wooden Desk",
    description: "A good desk.",
    category: "Furniture",
    condition_level: "good",
    origin_type: "donation",
    status: "available",
  },
  location: {
    address_line_1: "123 Main St",
    city: "Amherst",
    state: "MA",
  },
  owner: {
    id: "owner-1",
    email: "owner@example.com",
    full_name: "Owner User",
  },
  primary_image_url: "",
  pickup_type: "owner_meetup",
  pickup_notes: "Meet at lobby.",
  created_at: new Date().toISOString(),
};

const condition = {
  label: "Good",
  classes: "bg-green-100 text-green-800",
};

function renderListingDetail({
  initialEntry = "/item/listing-1",
  listing = baseListing,
} = {}) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/item/:listingId"
          element={
            <>
              <ListingDetailView
                listing={listing}
                loading={false}
                error=""
                condition={condition}
                requestMessage=""
                setRequestMessage={jest.fn()}
                submittingRequest={false}
                requestSuccess=""
                handleRequestItem={jest.fn()}
              />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockUser = {
    id: "requester-1",
    email: "requester@example.com",
  };
});

test("renders listing detail information", () => {
  renderListingDetail();

  expect(screen.getByText("Wooden Desk")).toBeInTheDocument();
  expect(screen.getByText("A good desk.")).toBeInTheDocument();
  expect(screen.getByText("Furniture")).toBeInTheDocument();
  expect(screen.getByText("Meet at lobby.")).toBeInTheDocument();
});

test("owner sees manage listing card instead of request form", () => {
  mockUser = {
    id: "owner-1",
    email: "owner@example.com",
  };

  renderListingDetail();

  expect(screen.getByText("Manage Your Listing")).toBeInTheDocument();
  expect(screen.getByText("Edit Listing")).toBeInTheDocument();
  expect(screen.queryByText("Request This Item")).not.toBeInTheDocument();
});

test("non-owner without request sees request form", () => {
  renderListingDetail();

  expect(
    screen.getByRole("heading", { name: "Request This Item" })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: "Request This Item" })
  ).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/I'm interested in this item/i)).toBeInTheDocument();
});

test("accepted requester sees Message button", () => {
  const listing = {
    ...baseListing,
    user_request: {
      id: "request-1",
      message: "I want this.",
      status: "accepted",
      created_at: new Date().toISOString(),
    },
  };

  renderListingDetail({ listing });

  expect(screen.getByText("Your Request")).toBeInTheDocument();
  expect(screen.getByText("Accepted")).toBeInTheDocument();
  expect(screen.getByText("💬 Message")).toBeInTheDocument();
});

test("clicking Message opens ChatModal", async () => {
  const listing = {
    ...baseListing,
    user_request: {
      id: "request-1",
      message: "I want this.",
      status: "accepted",
      created_at: new Date().toISOString(),
    },
  };

  renderListingDetail({ listing });

  await userEvent.click(screen.getByText("💬 Message"));

  expect(screen.getByTestId("chat-modal")).toBeInTheDocument();
  expect(screen.getByTestId("chat-modal")).toHaveTextContent("listingId: listing-1");
  expect(screen.getByTestId("chat-modal")).toHaveTextContent("listingTitle: Wooden Desk");
});

test("openChat query automatically opens ChatModal", async () => {
  renderListingDetail({
    initialEntry: "/item/listing-1?openChat=1&messageId=message-1",
  });

  await waitFor(() => {
    expect(screen.getByTestId("chat-modal")).toBeInTheDocument();
  });

  expect(screen.getByTestId("chat-modal")).toHaveTextContent("listingId: listing-1");
});

test("closing ChatModal removes openChat query", async () => {
  renderListingDetail({
    initialEntry: "/item/listing-1?openChat=1&messageId=message-1",
  });

  await screen.findByTestId("chat-modal");

  await userEvent.click(screen.getByText("Close Chat"));

  await waitFor(() => {
    expect(screen.queryByTestId("chat-modal")).not.toBeInTheDocument();
  });

  expect(screen.getByTestId("location-display")).toHaveTextContent("/item/listing-1");
});