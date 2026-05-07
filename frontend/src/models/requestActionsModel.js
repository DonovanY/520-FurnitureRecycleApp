import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Accept or decline a request
 * @param {string} requestId - The ID of the request to update
 * @param {string} status - "accepted" or "rejected"
 */
export async function updateRequestStatus(requestId, status) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/requests/${requestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update request: ${text}`);
  }

  return await response.json();
}

/**
 * Send a message in a listing conversation
 * @param {string} listingId - The listing ID
 * @param {string} recipientUserId - The recipient user ID
 * @param {string} content - The message content
 */
export async function sendMessage(listingId, recipientUserId, content) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      listing_id: listingId,
      recipient_user_id: recipientUserId,
      content,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send message: ${text}`);
  }

  return await response.json();
}

/**
 * Get conversation messages for a listing
 * @param {string} listingId - The listing ID
 */
export async function fetchConversation(listingId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/messages/${listingId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch conversation: ${text}`);
  }

  return await response.json();
}
