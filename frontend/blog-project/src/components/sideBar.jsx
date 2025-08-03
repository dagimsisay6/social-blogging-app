// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SideBarContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar(); // Get sidebar state and close function
  const { isAuthenticated } = useAuth(); // Get authentication status from AuthContext
  const location = useLocation(); // Hook to get current URL path for active link highlighting

  // Define your sidebar links
  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        // Dashboard Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      authRequired: true, // This link requires authentication
    },
    {
      name: "All Posts",
      path: "/posts",
      icon: (
        // All Posts Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      authRequired: false, // This link does not require authentication
    },
    {
      name: "Create Post",
      path: "/create-post",
      icon: (
        // Create Post Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      authRequired: true, // This link requires authentication
    },
    {
      name: "My Posts",
      path: "/my-posts",
      icon: (
        // My Posts Icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      authRequired: true, // This link requires authentication
    },
    // Add more sidebar links here following the same structure
  ];

  return (
    <>
      {/* Overlay: Appears when sidebar is open on small screens to dim the background */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar} // Close sidebar when clicking outside
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-30
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none lg:w-auto lg:h-auto`}
      >
        {/* Sidebar Header with only Close Button (for small screens) */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end items-center">
          {/* Close button for small/medium screens */}
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-5">
          <ul>
            {sidebarLinks.map((link) => {
              // Conditionally render links based on authentication status
              if (!link.authRequired || isAuthenticated) {
                // Check if the current link's path matches the current URL for highlighting
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={closeSidebar} // Close sidebar when a link is clicked
                      className={`flex items-center p-4 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600" // Active link styling
                          : ""
                      }`}
                    >
                      <span className="mr-3">{link.icon}</span> {/* Icon */}
                      {link.name} {/* Link text */}
                    </Link>
                  </li>
                );
              }
              return null; // Don't render if auth is required and user is not authenticated
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
