import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SidebarProvider, useSidebar } from "./context/SideBarContext.jsx"; // Import useSidebar
import WelcomePage from "./pages/welcomePage";
import SignUpPage from "./pages/signupPage";
import LoginPage from "./pages/loginPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import Navbar from "./components/navBar";
import Sidebar from "./components/sideBar.jsx";
import Dashboard from "./components/dashboard";
import CreatePost from "./pages/CreatePost.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import EditPost from "./pages/EditPost.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";
// IMPORT AllPosts component
import AllPosts from "./pages/AllPosts.jsx";

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Main App Component ---
function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          {/* Fixed Navbar */}
          <Navbar />
          {/* Main Container - positioned below the fixed navbar */}
          <AppContent />{" "}
          {/* Extract main content into a separate component to use useSidebar hook */}
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

// New component to handle main content and sidebar interaction
const AppContent = () => {
  const { isSidebarOpen } = useSidebar(); // Access sidebar state

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "ml-64 lg:ml-64" : "ml-0 lg:ml-64"}`}
      >
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* NEW ROUTE: Add the AllPosts component */}
          <Route path="/posts" element={<AllPosts />} />

          {/* --- Protected Routes --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />

          {/* --- Post Details Page --- */}
          <Route path="/posts/:id" element={<PostDetails />} />

          {/* --- 404 Page --- */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-full text-gray-700 dark:text-gray-300">
                <h1 className="text-4xl font-bold mb-4">
                  404 - Page Not Found
                </h1>
                <p className="text-lg">
                  The page you are looking for does not exist.
                </p>
                <Link
                  to="/"
                  className="mt-6 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go to Home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <ChatbotWidget />
    </div>
  );
};

export default App;
