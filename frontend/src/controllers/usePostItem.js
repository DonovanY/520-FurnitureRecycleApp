import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../models/postItemModel";
import { useAuth } from "../context/AuthContext";

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.address) return {};
    const a = data.address;
    return {
      address_line_1: [a.house_number, a.road].filter(Boolean).join(" ") || null,
      city: a.city || a.town || a.village || a.county || null,
      state: a.state || null,
      postal_code: a.postcode || null,
      country: a.country || null,
    };
  } catch {
    return {};
  }
}

async function forwardGeocode(addressLine1, addressLine2, city, state, postalCode, country) {
  const query = [addressLine1, addressLine2, city, state, postalCode, country]
    .filter(Boolean)
    .join(", ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data[0]) return null;
    return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

function usePostItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [conditionLevel, setConditionLevel] = useState("");
  const [originType, setOriginType] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [pickupType, setPickupType] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Location choice: "current" | "address"
  const [locationChoice, setLocationChoice] = useState("current");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressState, setAddressState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) { setError("Title is required"); return; }
    if (!category) { setError("Category is required"); return; }
    if (!conditionLevel) { setError("Condition is required"); return; }
    if (!originType) { setError("Origin type is required"); return; }

    if (locationChoice === "address") {
      if (!addressLine1.trim()) { setError("Address Line 1 is required"); return; }
      if (!city.trim()) { setError("City is required"); return; }
    } else {
      if (!city.trim()) { setError("City is required (used as fallback if GPS is unavailable)"); return; }
    }

    if (imageUrl.trim()) {
      if (imageUrl.startsWith("data:")) {
        setError("Base64 data URLs are not supported. Please use a regular image URL.");
        return;
      }
      if (imageUrl.length > 2000) {
        setError("Image URL is too long (must be under 2000 characters).");
        return;
      }
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let latitude = null;
      let longitude = null;
      let locationFields = {};

      if (locationChoice === "current") {
        // GPS → reverse geocode for address
        if (!navigator.geolocation) {
          setError("Your browser does not support GPS. Please switch to 'Enter item address'.");
          setLoading(false);
          return;
        }
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
          );
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          locationFields = await reverseGeocode(latitude, longitude);
          if (!locationFields.city) locationFields.city = city.trim();
        } catch {
          setError("GPS access was denied or timed out. Please allow location access or switch to 'Enter item address'.");
          setLoading(false);
          return;
        }
      } else {
        // Manual address → forward geocode for lat/lng (required)
        const coords = await forwardGeocode(
          addressLine1.trim(), addressLine2.trim(),
          city.trim(), addressState.trim(), postalCode.trim(), country.trim()
        );
        if (!coords) {
          setError("Address not found. Please try a more specific address (include street number, city, and state).");
          setLoading(false);
          return;
        }
        latitude = coords.latitude;
        longitude = coords.longitude;
        locationFields = {
          address_line_1: addressLine1.trim() || null,
          address_line_2: addressLine2.trim() || null,
          state: addressState.trim() || null,
          postal_code: postalCode.trim() || null,
          country: country.trim() || null,
        };
      }

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
        latitude,
        longitude,
        ...locationFields,
      };

      const result = await createListing(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/item/${result.id}`), 1000);
    } catch (err) {
      setError(err.message || "Failed to create listing");
      setLoading(false);
    }
  };

  return {
    title, setTitle,
    category, setCategory,
    conditionLevel, setConditionLevel,
    originType, setOriginType,
    city, setCity,
    description, setDescription,
    pickupType, setPickupType,
    pickupNotes, setPickupNotes,
    imageUrl, setImageUrl,
    locationChoice, setLocationChoice,
    addressLine1, setAddressLine1,
    addressLine2, setAddressLine2,
    addressState, setAddressState,
    postalCode, setPostalCode,
    country, setCountry,
    loading, error, success,
    handleSubmit,
  };
}

export default usePostItem;
