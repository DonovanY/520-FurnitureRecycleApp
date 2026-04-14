import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar component
 *
 * Displays the app header with navigation links.
 * Auth-aware: shows Log In / Sign Up when logged out,
 * shows user email and Logout button when logged in.
 */
function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-green-700">
        FurniCycle
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile" className="text-sm text-gray-600">
              {user.email}
            </Link>
            <Link to="/">
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Logout
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">
              Log In
            </Link>
            <Link
              to="/signup"
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
