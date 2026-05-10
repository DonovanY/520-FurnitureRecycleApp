jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

import { supabase } from "../lib/supabaseClient";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../models/notificationModel";

import {
  updateRequestStatus,
  sendMessage,
  fetchConversation,
} from "../models/requestActionsModel";

beforeEach(() => {
  jest.clearAllMocks();

  supabase.auth.getSession.mockResolvedValue({
    data: {
      session: {
        access_token: "test-token",
      },
    },
  });

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
      text: () => Promise.resolve(""),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("fetchNotifications calls correct API path with auth header", async () => {
  await fetchNotifications({ page: 2, pageSize: 8 });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/notifications?page=2&page_size=8",
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    })
  );
});

test("fetchUnreadCount calls correct API path", async () => {
  await fetchUnreadCount();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/notifications/unread-count",
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    })
  );
});

test("markNotificationAsRead calls correct API path", async () => {
  await markNotificationAsRead("notification-1");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/notifications/notification-1/read",
    expect.objectContaining({
      method: "PATCH",
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    })
  );
});

test("markAllNotificationsAsRead calls correct API path", async () => {
  await markAllNotificationsAsRead();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/notifications/read-all",
    expect.objectContaining({
      method: "PATCH",
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    })
  );
});

test("updateRequestStatus sends PATCH request with status payload", async () => {
  await updateRequestStatus("request-1", "accepted");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/requests/request-1",
    expect.objectContaining({
      method: "PATCH",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      }),
      body: JSON.stringify({ status: "accepted" }),
    })
  );
});

test("sendMessage sends POST request with message payload", async () => {
  await sendMessage("listing-1", "recipient-1", "Hello");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/messages",
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      }),
      body: JSON.stringify({
        listing_id: "listing-1",
        recipient_user_id: "recipient-1",
        content: "Hello",
      }),
    })
  );
});

test("fetchConversation calls correct API path", async () => {
  await fetchConversation("listing-1");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://localhost:8000/api/v1/messages/listing-1",
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
    })
  );
});