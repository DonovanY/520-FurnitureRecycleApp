import { createContext, useContext, useEffect, useState } from "react";
import * as authModel from "../models/authModel";

const AuthContext = createContext({});

/**
 * AuthProvider context wrapper
 *
 * Wraps the entire app to provide auth state globally.
 * Any component can call useAuth() to access user, loading, and signOut.
 * Delays rendering children until the initial session check completes.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until first session check completes

  useEffect(() => {
    // check for an existing session on mount (e.g. user refreshed the page)
    authModel.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout) and update user automatically.
    // Allows the app to react to auth changes without manual refresh or re-checks.
    const subscription = authModel.onAuthStateChange((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await authModel.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook
 *
 * Provides access to auth state from any component.
 * @returns {{ user: object|null, loading: boolean, signOut: function }}
 */
export const useAuth = () => useContext(AuthContext);
