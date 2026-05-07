import { supabase } from "../lib/supabaseClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

/**
 * postItemModel.js
 *
 * Handles API calls for creating new listings.
 */

/**
 * Create a new listing
 *
 * @param {Object} data
 * @param {string} data.title - Item title (required)
 * @param {string} data.category - Category (required)
 * @param {string} data.condition_level - Condition (required)
 * @param {string} data.origin_type - Origin type (required)
 * @param {string} data.city - City (required)
 * @param {string} [data.description] - Item description (optional)
 * @param {string} [data.pickup_type] - Pickup type (optional)
 * @param {string} [data.pickup_notes] - Pickup notes (optional)
 * @param {string} [data.image_url] - Image URL (optional)
 *
 * @returns {Promise<{ id: string, message: string }>}
 */
export async function updateListing(id, data) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("You must be logged in to edit a listing");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update listing: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("updateListing error:", error);
    throw error;
  }
}

export async function createListing(data) {
  try {
    // Get auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("You must be logged in to create a listing");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create listing: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("createListing error:", error);
    throw error;
  }
}
