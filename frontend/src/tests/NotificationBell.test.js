import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../models/notificationModel";

jest.mock("../models/notificationModel", () => ({
  fetchNotifications: jest.fn(),
  fetchUnreadCount: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      email: "user@example.com",
    },
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

function renderNotificationBell() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <NotificationBell />
      <LocationDisplay />
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();

  fetchUnreadCount.mockResolvedValue({ unread_count: 1 });
  markNotificationAsRead.mockResolvedValue({ id: "n1", is_read: true });
  markAllNotificationsAsRead.mockResolvedValue({ updated_count: 1 });
});

test("new_request notification navigates to profile posted requests modal", async () => {
  fetchNotifications.mockResolvedValue({
    items: [
      {
        id: "n1",
        type: "new_request",
        title: "New item request",
        message: "Someone requested your item.",
        listing_id: "listing-1",
        request_id: "request-1",
        message_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    unread_count: 1,
    page: 1,
    total_pages: 1,
  });

  renderNotificationBell();

  await userEvent.click(screen.getByLabelText("Notifications"));
  await screen.findByText("New item request");

  await userEvent.click(screen.getByText("New item request"));

  await waitFor(() => {
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/profile?tab=posted&openRequests=1&listingId=listing-1"
    );
  });

  expect(markNotificationAsRead).toHaveBeenCalledWith("n1");
});

test("new_message notification navigates to item page and opens chat", async () => {
  fetchNotifications.mockResolvedValue({
    items: [
      {
        id: "n1",
        type: "new_message",
        title: "New message",
        message: "Someone sent you a message.",
        listing_id: "listing-2",
        request_id: null,
        message_id: "message-2",
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    unread_count: 1,
    page: 1,
    total_pages: 1,
  });

  renderNotificationBell();

  await userEvent.click(screen.getByLabelText("Notifications"));
  await screen.findByText("New message");

  await userEvent.click(screen.getByText("New message"));

  await waitFor(() => {
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/item/listing-2?openChat=1&messageId=message-2"
    );
  });
});

test("request_accepted notification navigates to item page and opens chat", async () => {
  fetchNotifications.mockResolvedValue({
    items: [
      {
        id: "n1",
        type: "request_accepted",
        title: "Request accepted",
        message: "Your request was accepted.",
        listing_id: "listing-3",
        request_id: "request-3",
        message_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    unread_count: 1,
    page: 1,
    total_pages: 1,
  });

  renderNotificationBell();

  await userEvent.click(screen.getByLabelText("Notifications"));
  await screen.findByText("Request accepted");

  await userEvent.click(screen.getByText("Request accepted"));

  await waitFor(() => {
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/item/listing-3?openChat=1"
    );
  });
});

test("request_rejected notification navigates to item page without opening chat", async () => {
  fetchNotifications.mockResolvedValue({
    items: [
      {
        id: "n1",
        type: "request_rejected",
        title: "Request declined",
        message: "Your request was declined.",
        listing_id: "listing-4",
        request_id: "request-4",
        message_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    unread_count: 1,
    page: 1,
    total_pages: 1,
  });

  renderNotificationBell();

  await userEvent.click(screen.getByLabelText("Notifications"));
  await screen.findByText("Request declined");

  await userEvent.click(screen.getByText("Request declined"));

  await waitFor(() => {
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/item/listing-4"
    );
  });
});

test("mark all as read calls markAllNotificationsAsRead", async () => {
  fetchNotifications.mockResolvedValue({
    items: [
      {
        id: "n1",
        type: "new_request",
        title: "New item request",
        message: "Someone requested your item.",
        listing_id: "listing-1",
        request_id: "request-1",
        message_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    unread_count: 1,
    page: 1,
    total_pages: 1,
  });

  renderNotificationBell();

  await userEvent.click(screen.getByLabelText("Notifications"));
  await screen.findByText("Mark all as read");

  await userEvent.click(screen.getByText("Mark all as read"));

  expect(markAllNotificationsAsRead).toHaveBeenCalledTimes(1);
});