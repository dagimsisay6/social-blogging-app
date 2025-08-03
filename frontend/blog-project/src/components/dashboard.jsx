// src/components/Dashboard.jsx (Updated to be simpler)
import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isAuthenticated, loading, logout } = useAuth(); // Also get logout for a button
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500">
        User data not available. Please log in.
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            Welcome, {fullName}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            This is your personalized dashboard.
          </p>
        </div>

        {/* User Information Card */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Profile Details
          </h3>
          <div className="text-left space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Full Name:</span> {fullName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            {/* You can add more user-specific data here if your schema grows */}
            {/* For example, if you added a 'bio' or 'registrationDate' */}
            <p className="text-gray-500 text-sm mt-4">
              Account created: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Dashboard Content Area (can be customized based on your app's purpose) */}
        <section className="dashboard-content">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Your Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-3">
                Recent Activity
              </h3>
              <p className="text-gray-700">No recent activities to show yet.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                View Activity Log
              </button>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">
                Settings
              </h3>
              <p className="text-gray-700">Manage your account settings.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Go to Settings
              </button>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-10 w-full py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
