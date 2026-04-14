import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchListingById, requestListing } from "../api/listingsApi";
import { supabase } from "../lib/supabaseClient";

function normalizeCondition(conditionLevel) {
  const map = {
    like_new: { label: "Like New", classes: "bg-green-100 text-green-800" },
    good: { label: "Good", classes: "bg-blue-100 text-blue-800" },
    fair: { label: "Fair", classes: "bg-yellow-100 text-yellow-800" },
    poor: { label: "Poor", classes: "bg-red-100 text-red-800" },
  };

  return (
    map[conditionLevel] ?? {
      label: conditionLevel || "Unknown",
      classes: "bg-gray-100 text-gray-800",
    }
  );
}

export default function useListingDetail() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState("");

  const loadListing = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchListingById(id);
      setListing(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to load listing details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id, loadListing]);

  const condition = useMemo(() => {
    if (!listing?.item) {
      return {
        label: "Unknown",
        classes: "bg-gray-100 text-gray-800",
      };
    }
    return normalizeCondition(listing.item.condition_level);
  }, [listing]);

  const handleRequestItem = async () => {
    try {
      setSubmittingRequest(true);
      setRequestSuccess("");
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      await requestListing(
        id,
        {
          message: requestMessage.trim(),
        },
        token
      );

      setRequestSuccess("Your request has been submitted successfully.");
      setRequestMessage("");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to submit item request."
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  return {
    listing,
    loading,
    error,
    condition,
    requestMessage,
    setRequestMessage,
    submittingRequest,
    requestSuccess,
    handleRequestItem,
    reloadListing: loadListing,
  };
}