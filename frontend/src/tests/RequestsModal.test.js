import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequestsModal from "../components/RequestsModal";

import { fetchListingRequests } from "../models/listingRequestsModel";
import { updateRequestStatus } from "../models/requestActionsModel";

jest.mock("../models/listingRequestsModel", () => ({
  fetchListingRequests: jest.fn(),
}));

jest.mock("../models/requestActionsModel", () => ({
  updateRequestStatus: jest.fn(),
}));

jest.mock("../components/ChatModal", () => function MockChatModal({
  listingId,
  listingTitle,
  otherUserId,
  otherUserName,
}) {
  return (
    <div data-testid="chat-modal">
      <div>ChatModal</div>
      <div>listingId: {listingId}</div>
      <div>listingTitle: {listingTitle}</div>
      <div>otherUserId: {otherUserId}</div>
      <div>otherUserName: {otherUserName}</div>
    </div>
  );
});

beforeEach(() => {
  jest.clearAllMocks();
  updateRequestStatus.mockResolvedValue({});
});

function renderRequestsModal(props = {}) {
  return render(
    <RequestsModal
      listingId="listing-1"
      listingTitle="Wooden Desk"
      onClose={jest.fn()}
      onRequestUpdated={jest.fn()}
      {...props}
    />
  );
}

test("loads and displays pending requests", async () => {
  fetchListingRequests.mockResolvedValue([
    {
      id: "request-1",
      listing_id: "listing-1",
      requester: {
        id: "requester-1",
        email: "requester@example.com",
        full_name: "Requester User",
      },
      message: "Can I pick this up?",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  renderRequestsModal();

  expect(screen.getByText("Loading requests...")).toBeInTheDocument();

  await screen.findByText("Requester User");

  expect(screen.getByText("requester@example.com")).toBeInTheDocument();
  expect(screen.getByText("Can I pick this up?")).toBeInTheDocument();
  expect(screen.getByText("Accept")).toBeInTheDocument();
  expect(screen.getByText("Decline")).toBeInTheDocument();
});

test("clicking Accept updates request status to accepted", async () => {
  fetchListingRequests.mockResolvedValue([
    {
      id: "request-1",
      listing_id: "listing-1",
      requester: {
        id: "requester-1",
        email: "requester@example.com",
        full_name: "Requester User",
      },
      message: "Can I pick this up?",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  const onRequestUpdated = jest.fn();

  renderRequestsModal({ onRequestUpdated });

  await screen.findByText("Accept");

  await userEvent.click(screen.getByText("Accept"));

  expect(updateRequestStatus).toHaveBeenCalledWith("request-1", "accepted");

  await waitFor(() => {
    expect(onRequestUpdated).toHaveBeenCalledTimes(1);
  });
});

test("clicking Decline updates request status to rejected", async () => {
  fetchListingRequests.mockResolvedValue([
    {
      id: "request-1",
      listing_id: "listing-1",
      requester: {
        id: "requester-1",
        email: "requester@example.com",
        full_name: "Requester User",
      },
      message: "Can I pick this up?",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  renderRequestsModal();

  await screen.findByText("Decline");

  await userEvent.click(screen.getByText("Decline"));

  expect(updateRequestStatus).toHaveBeenCalledWith("request-1", "rejected");
});

test("accepted request shows Message button and opens ChatModal", async () => {
  fetchListingRequests.mockResolvedValue([
    {
      id: "request-1",
      listing_id: "listing-1",
      requester: {
        id: "requester-1",
        email: "requester@example.com",
        full_name: "Requester User",
      },
      message: "Can I pick this up?",
      status: "accepted",
      created_at: new Date().toISOString(),
    },
  ]);

  renderRequestsModal();

  await screen.findByText("💬 Message");

  await userEvent.click(screen.getByText("💬 Message"));

  expect(screen.getByTestId("chat-modal")).toBeInTheDocument();
  expect(screen.getByTestId("chat-modal")).toHaveTextContent("listingId: listing-1");
  expect(screen.getByTestId("chat-modal")).toHaveTextContent("otherUserId: requester-1");
});

test("empty requests displays no requests message", async () => {
  fetchListingRequests.mockResolvedValue([]);

  renderRequestsModal();

  await screen.findByText("No requests yet");

  expect(screen.getByText("When someone requests this item, they'll appear here.")).toBeInTheDocument();
});