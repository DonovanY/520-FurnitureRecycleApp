import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatModal from "../components/ChatModal";

import { fetchConversation, sendMessage } from "../models/requestActionsModel";

jest.mock("../models/requestActionsModel", () => ({
  fetchConversation: jest.fn(),
  sendMessage: jest.fn(),
}));

const conversationResponse = {
  listing_id: "listing-1",
  listing_title: "Wooden Desk",
  other_user_id: "owner-1",
  other_user_name: "Owner User",
  messages: [
    {
      id: "message-1",
      listing_id: "listing-1",
      sender_user_id: "owner-1",
      sender_name: "Owner User",
      recipient_user_id: "requester-1",
      recipient_name: "Requester User",
      content: "Hello!",
      is_read: "false",
      created_at: new Date().toISOString(),
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();

  fetchConversation.mockResolvedValue(conversationResponse);
  sendMessage.mockResolvedValue({
    id: "message-2",
  });
});

function renderChatModal(props = {}) {
  return render(
    <ChatModal
      listingId="listing-1"
      listingTitle="Wooden Desk"
      otherUserId="owner-1"
      otherUserName="Owner User"
      onClose={jest.fn()}
      {...props}
    />
  );
}

test("loads and displays conversation messages", async () => {
  renderChatModal();

  expect(screen.getByText(/Loading messages/i)).toBeInTheDocument();

  await screen.findByText("Hello!");

  expect(fetchConversation).toHaveBeenCalledWith("listing-1");

  expect(
    screen.getByRole("heading", { name: /Chat with\s+Owner User/i })
  ).toBeInTheDocument();

  expect(screen.getByText("Wooden Desk")).toBeInTheDocument();
});

test("sending a message calls sendMessage and reloads conversation", async () => {
  renderChatModal();

  await screen.findByText("Hello!");

  const input = screen.getByPlaceholderText(/Type your message/i);

  await userEvent.type(input, "Can I pick it up tomorrow?");
  await userEvent.click(screen.getByRole("button", { name: "Send" }));

  expect(sendMessage).toHaveBeenCalledWith(
    "listing-1",
    "owner-1",
    "Can I pick it up tomorrow?"
  );

  await waitFor(() => {
    expect(fetchConversation).toHaveBeenCalledTimes(2);
  });
});

test("handles conversation fetch failure without crashing", async () => {
  fetchConversation.mockImplementation(() =>
    Promise.reject(new Error("Failed to load conversation"))
  );

  renderChatModal();

  await waitFor(() => {
    expect(fetchConversation).toHaveBeenCalledWith("listing-1");
  });

  expect(screen.getByRole("heading", { name: /Chat with\s+Owner User/i }))
    .toBeInTheDocument();
});

test("close button calls onClose", async () => {
  const onClose = jest.fn();

  renderChatModal({ onClose });

  await screen.findByText("Hello!");

  await userEvent.click(screen.getByLabelText("Close modal"));

  expect(onClose).toHaveBeenCalledTimes(1);
});