import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authModel from "../models/authModel";

/**
 * useAuthForm controller hook
 *
 * Manages form state and submission logic for login and signup views.
 * Keeps the view layer free of auth logic.
 *
 * @param {"login"|"signup"} mode — determines which authModel function to call
 * @returns {{ email, setEmail, password, setPassword, error, loading, handleSubmit }}
 */
export default function useAuthForm(mode) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // error message string, or null
  const [loading, setLoading] = useState(false); // true while waiting for Supabase
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // clear any previous error
    setLoading(true);

    try {
      if (mode === "signup") {
        await authModel.signUp(email, password);
      } else {
        await authModel.signIn(email, password);
      }
      // On success, Supabase stores the session automatically.
      // AuthContext detects it via onAuthStateChange and updates user.
      navigate("/");
    } catch (err) {
      setError(err.message); // view will display this
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, loading, handleSubmit };
}
