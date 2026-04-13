import api from "./axios";

export async function fetchListingById(listingId) {
  const response = await api.get(`/listings/${listingId}`);
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