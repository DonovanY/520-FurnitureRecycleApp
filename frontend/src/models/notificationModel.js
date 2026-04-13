import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
}

async function authFetch(url, options = {}) {
  const token = await getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  return response;
}

export async function fetchNotifications({ page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  const response = await authFetch(
    `${API_BASE_URL}/notifications?${params.toString()}`,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications.");
  }

  return await response.json();
}

export async function fetchUnreadCount() {
  const response = await authFetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread count.");
  }

  return await response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await authFetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    { method: "PATCH" }
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read.");
  }

  return await response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await authFetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read.");
  }

  return await response.json();
}