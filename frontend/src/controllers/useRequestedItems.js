/**
 * useRequestedItems.js
 *
 * Controller hook for managing requested items state.
 */

import { useEffect, useState } from "react";
import { fetchRequestedItems } from "../models/requestedItemsModel";

export default function useRequestedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchRequestedItems();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to load requested items");
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    refetch: loadItems,
  };
}
