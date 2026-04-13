import { useEffect, useMemo, useState } from "react";
import { fetchListings } from "../models/listingsModel";

function useDashboard() {
  const [allListings, setAllListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchListings();
        const rawListings = Array.isArray(data) ? data : (data.items ?? []);

        const normalized = rawListings.map((listing) => ({
          id: listing.id,
          title: listing.item?.title ?? "",
          description: listing.item?.description ?? "",
          category: listing.item?.category ?? "",
          condition_level: listing.item?.condition_level ?? "",
          origin_type: listing.item?.origin_type ?? "",
          status: listing.item?.status ?? "",
          city: listing.location?.city ?? "",
          state: listing.location?.state ?? "",
          primary_image_url: listing.primary_image_url ?? null,
          created_at: listing.created_at,
        }));

        setAllListings(normalized);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const listings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allListings;

    return allListings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        listing.category.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q) ||
        listing.state.toLowerCase().includes(q)
      );
    });
  }, [allListings, searchQuery]);

  return {
    listings,
    searchQuery,
    setSearchQuery,
    loading,
    error,
  };
}

export default useDashboard;