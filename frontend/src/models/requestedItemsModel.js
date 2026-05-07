/**
 * requestedItemsModel.js
 *
 * Model layer for fetching items the current user has requested.
 */

import { supabase } from "../lib/supabaseClient";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch all items the current user has requested
 * @returns {Promise<Array>} Array of requested items with request details
 */
export async function fetchRequestedItems() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE}/api/v1/profile/requested_items`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch requested items");
  }

  const data = await response.json();
  return data.items || [];
}
