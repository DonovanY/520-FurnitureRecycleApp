import api from "./axios";
import { supabase } from "../lib/supabaseClient";

export async function fetchListingById(listingId) {
  // Get auth token if available
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const config = session?.access_token
    ? {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    : undefined;

  const response = await api.get(`/listings/${listingId}`, config);
  return response.data;
}

export async function requestListing(listingId, payload, token) {
  const response = await api.post(
    `/listings/${listingId}/request`,
    payload,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );

  return response.data;
}
