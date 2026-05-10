import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
}

async function authFetch(path, options = {}) {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
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

  const response = await authFetch(`/notifications?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch notifications: ${text}`);
  }

  return await response.json();
}

export async function fetchUnreadCount() {
  const response = await authFetch("/notifications/unread-count", {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch unread count: ${text}`);
  }

  return await response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await authFetch(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to mark notification as read: ${text}`);
  }

  return await response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await authFetch("/notifications/read-all", {
    method: "PATCH",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to mark all notifications as read: ${text}`);
  }

  return await response.json();
}