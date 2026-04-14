import { supabase } from "../lib/supabaseClient";
/**
 * listingsModel.js
 *
 * Handles API calls related to listings.
 * Supports pagination and optional search query.
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch listings with pagination + optional search
 *
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @param {string} params.search
 *
 * @returns {Promise<{
 *   items: Array,
 *   page: number,
 *   page_size: number,
 *   total: number,
 *   total_pages: number
 * }>}
 */
export async function fetchListings({
  page = 1,
  pageSize = 12,
  search = "",
} = {}) {
  try {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    if (search && search.trim()) {
      params.set("q", search.trim());
    }

    const url = `${API_BASE_URL}/api/v1/listings?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch listings: ${text}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return {
        items: data,
        page: 1,
        page_size: data.length,
        total: data.length,
        total_pages: 1,
      };
    }

    return {
      items: data.items ?? [],
      page: data.page ?? page,
      page_size: data.page_size ?? pageSize,
      total: data.total ?? 0,
      total_pages: data.total_pages ?? 1,
    };
  } catch (error) {
    console.error("fetchListings error:", error);
    throw error;
  }
}

/**
 * Fetch single listing detail
 *
 * @param {string} listingId
 */
export async function fetchListingDetail(listingId) {
  const url = `${API_BASE_URL}/api/v1/listings/${listingId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch listing detail.");
  }

  return await response.json();
}

/**
 * Request a listing (pickup request)
 *
 * Requires user to be logged in (Supabase token)
 */

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
}

export async function requestListing(listingId, message = "") {
  const token = await getAccessToken();

  const url = `${API_BASE_URL}/api/v1/listings/${listingId}/request`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to request item.");
  }

  return await response.json();
}