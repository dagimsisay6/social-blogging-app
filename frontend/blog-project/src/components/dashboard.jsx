// src/components/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext"; // Import the auth context

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Loading your dashboard...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">No user data available</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <div className="flex items-center">
            <span className="text-xl font-semibold">
              {user.firstName}'s Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-content p-4">
        {/* User Profile Section */}
        <section className="user-profile bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
          <img
            src={user.profilePicture || "https://via.placeholder.com/100"}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full object-cover mr-6 border-4 border-blue-500"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </section>

        <nav className="flex justify-around border-b border-gray-300 mb-6">
          <button className="py-3 px-6 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Posts
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Dashboard;
