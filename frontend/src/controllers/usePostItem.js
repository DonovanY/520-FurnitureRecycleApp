import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../models/postItemModel";
import { useAuth } from "../context/AuthContext";

/**
 * usePostItem controller
 *
 * Manages form state and submission logic for creating a new listing.
 * Follows MVC pattern — no JSX, only state + logic.
 */
function usePostItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [conditionLevel, setConditionLevel] = useState("");
  const [originType, setOriginType] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [pickupType, setPickupType] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    if (!conditionLevel) {
      setError("Condition is required");
      return;
    }
    if (!originType) {
      setError("Origin type is required");
      return;
    }
    if (!city.trim()) {
      setError("City is required");
      return;
    }

    // Validate image URL if provided
    if (imageUrl.trim()) {
      if (imageUrl.startsWith("data:")) {
        setError(
          "Base64 data URLs are not supported. Please use a regular image URL (e.g., from Imgur or Unsplash)."
        );
        return;
      }
      if (imageUrl.length > 2000) {
        setError("Image URL is too long. Please use a shorter URL (under 2000 characters).");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        title: title.trim(),
        category,
        condition_level: conditionLevel,
        origin_type: originType,
        city: city.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(pickupType && { pickup_type: pickupType }),
        ...(pickupNotes.trim() && { pickup_notes: pickupNotes.trim() }),
        ...(imageUrl.trim() && { image_url: imageUrl.trim() }),
      };

      const result = await createListing(payload);

      setSuccess(true);

      // Redirect to the new listing after a brief delay
      setTimeout(() => {
        navigate(`/item/${result.id}`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to create listing");
      setLoading(false);
    }
  };

  return {
    // Form fields
    title,
    setTitle,
    category,
    setCategory,
    conditionLevel,
    setConditionLevel,
    originType,
    setOriginType,
    city,
    setCity,
    description,
    setDescription,
    pickupType,
    setPickupType,
    pickupNotes,
    setPickupNotes,
    imageUrl,
    setImageUrl,

    // UI state
    loading,
    error,
    success,

    // Actions
    handleSubmit,
  };
}

export default usePostItem;
