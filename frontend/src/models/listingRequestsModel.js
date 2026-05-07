/**
 * listingRequestsModel.js
 *
 * Model layer for fetching requests for a listing.
 */

import { supabase } from "../lib/supabaseClient";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch all requests for a specific listing
 * @param {string} listingId - The listing ID
 * @returns {Promise<Array>} Array of request objects
 */
export async function fetchListingRequests(listingId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_BASE}/api/v1/listings/${listingId}/requests`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch listing requests");
  }

  const data = await response.json();
  return data.requests || [];
}
