import { useState, useEffect } from "react";
import { getListings } from "../models/listingsModel";

/**
 * useDashboard controller hook
 *
 * Manages all state and data-fetching logic for the Dashboard view.
 * Keeps the view layer free of business logic.
 *
 * @returns {{ listings, searchQuery, setSearchQuery, loading, error }}
 */
function useDashboard() {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getListings({ search: searchQuery })
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  return { listings, searchQuery, setSearchQuery, loading, error };
}

export default useDashboard;
