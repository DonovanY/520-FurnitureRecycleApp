import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardView from "./views/DashboardView";
import LoginView from "./views/LoginView";
import SignupView from "./views/SignupView";
import ListingDetailPage from "./pages/ListingDetailPage";
import ProfileView from "./views/ProfileView";
import PostItemView from "./views/PostItemView";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
            <Route path="/item/:id" element={<ListingDetailPage />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route
              path="/post"
              element={
                <ProtectedRoute>
                  <PostItemView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
