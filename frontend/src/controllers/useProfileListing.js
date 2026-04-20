import { useEffect, useState } from "react";
import { fetchProfilePostedListings } from "../models/profileListingModel";


function useProfileListing() {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProfilePostedListings({
          page,
          pageSize,
          search: debouncedSearchQuery,
        });

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

        setListings(normalized);
        setTotal(data.total ?? normalized.length);
        setTotalPages(data.total_pages ?? 1);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || "Failed to load listings.");
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [page, pageSize, debouncedSearchQuery]);

  function goToPrevPage() {
    setPage((prev) => Math.max(1, prev - 1));
  }

  function goToNextPage() {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }

  return {
    listings,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    page,
    total,
    totalPages,
    goToPrevPage,
    goToNextPage,
  };
}

export default useProfileListing;