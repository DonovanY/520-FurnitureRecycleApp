import { supabase } from "../lib/supabaseClient";
/**
 * profileListingModel.js
 *
 * Handles API calls related to user's posted listings.
 * Supports pagination and optional search query.
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * Fetch user's posted listings with pagination + optional search
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


async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
}

export async function fetchProfilePostedListings({
  page = 1,
  pageSize = 12,
  search = "",
} = {}) {
  try {
    
    const token = await getAccessToken();

    console.log("Current Token:", token);

    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    if (search && search.trim()) {
      params.set("q", search.trim());
    }

    const url = `${API_BASE_URL}/api/v1/profile/posted_items?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch profile posted listings: ${text}`);
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
    console.error("fetchProfilePostedListings error:", error);
    throw error;
  }
}

// /**
//  * Fetch single listing detail
//  *
//  * @param {string} listingId
//  */
// export async function fetchListingDetail(listingId) {
//   const url = `${API_BASE_URL}/api/v1/listings/${listingId}`;

//   const response = await fetch(url);

//   if (!response.ok) {
//     throw new Error("Failed to fetch listing detail.");
//   }

//   return await response.json();
// }
