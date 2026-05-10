import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ProfileView from "../views/profileView";

jest.mock("../components/Navbar", () => function MockNavbar() {
  return <div data-testid="navbar">Navbar</div>;
});

jest.mock("../components/SearchBar", () => function MockSearchBar({ value, onChange }) {
  return (
    <input
      aria-label="Search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

jest.mock("../components/ItemGrid", () => function MockItemGrid({ listings }) {
  return (
    <div data-testid="item-grid">
      {listings.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
});

jest.mock("../components/PostedItemCard", () => function MockPostedItemCard({ listing }) {
  return <div data-testid="posted-item-card">{listing.item?.title || listing.title}</div>;
});

jest.mock("../components/RequestsModal", () => function MockRequestsModal({
  listingId,
  listingTitle,
  onClose,
}) {
  return (
    <div data-testid="requests-modal">
      <div>RequestsModal</div>
      <div>listingId: {listingId}</div>
      <div>listingTitle: {listingTitle}</div>
      <button onClick={onClose}>Close Requests Modal</button>
    </div>
  );
});

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "owner-1",
      email: "owner@example.com",
      user_metadata: {
        full_name: "Owner User",
      },
    },
  }),
}));

jest.mock("../controllers/useProfile", () => () => ({
  fullName: "Owner User",
  setFullName: jest.fn(),
  gender: "Prefer not to say",
  setGender: jest.fn(),
  email: "owner@example.com",
  setEmail: jest.fn(),
  newPassword: "",
  setNewPassword: jest.fn(),
  loading: false,
  error: "",
  success: false,
  handleEditProfile: jest.fn((event) => event.preventDefault()),
}));

jest.mock("../controllers/useProfileListing", () => () => ({
  listings: [
    {
      id: "listing-1",
      item: {
        title: "Desk",
        category: "Furniture",
        condition_level: "good",
      },
      location: {
        city: "Amherst",
      },
      created_at: new Date().toISOString(),
    },
  ],
  searchQuery: "",
  setSearchQuery: jest.fn(),
  loading: false,
  error: "",
  page: 1,
  total: 1,
  totalPages: 1,
  goToPrevPage: jest.fn(),
  goToNextPage: jest.fn(),
}));

jest.mock("../controllers/useRequestedItems", () => () => ({
  items: [],
  loading: false,
  error: "",
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

function renderProfile(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/profile"
          element={
            <>
              <ProfileView />
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

test("default profile route displays profile settings tab", () => {
  renderProfile("/profile");

  expect(
    screen.getByRole("heading", { name: "Profile Settings" })
    ).toBeInTheDocument();
  expect(screen.getByText("Manage your personal details and account credentials.")).toBeInTheDocument();
});

test("profile posted tab displays posted items", () => {
  renderProfile("/profile?tab=posted");

    expect(
        screen.getByRole("heading", { name: "Posted Items" })
    ).toBeInTheDocument();
  expect(screen.getByTestId("posted-item-card")).toHaveTextContent("Desk");
});

test("profile requested tab displays requested items", () => {
  renderProfile("/profile?tab=requested");

  expect(
    screen.getByRole("heading", { name: "Requested Items" })
    ).toBeInTheDocument();
  expect(screen.getByText("No requested items yet")).toBeInTheDocument();
});

test("new_request URL automatically opens RequestsModal for target listing", async () => {
  renderProfile("/profile?tab=posted&openRequests=1&listingId=listing-1");

  await waitFor(() => {
    expect(screen.getByTestId("requests-modal")).toBeInTheDocument();
  });

  expect(screen.getByTestId("requests-modal")).toHaveTextContent("listingId: listing-1");
  expect(screen.getByTestId("requests-modal")).toHaveTextContent("listingTitle: Desk");
});

test("closing RequestsModal removes openRequests and listingId from URL", async () => {
  renderProfile("/profile?tab=posted&openRequests=1&listingId=listing-1");

  await screen.findByTestId("requests-modal");

  await userEvent.click(screen.getByText("Close Requests Modal"));

  await waitFor(() => {
    expect(screen.queryByTestId("requests-modal")).not.toBeInTheDocument();
  });

  expect(screen.getByTestId("location-display")).toHaveTextContent("/profile?tab=posted");
});