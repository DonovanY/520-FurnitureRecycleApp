import { useState } from "react";
import { updateAuthCredentials } from "../models/profileModel";
import { useAuth } from "../context/AuthContext";

/**
 * useProfile controller hook
 *
 * Manages all state and data-fetching logic for the Profile view.
 * Keeps the view layer free of business logic.
 *
 * @returns {{ email, setEmail, newPassword, setNewPassword, loading, error, success, handleEditProfile }}
 */
export default function useProfile() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updateData = {};

      if (email !== user.email) {
        updateData.email = email;
      }

      if (newPassword) {
        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setLoading(false);
        return;
      }

      await updateAuthCredentials(updateData);
      setSuccess(true);
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    newPassword,
    setNewPassword,
    loading,
    error,
    success,
    handleEditProfile,
  };
}
