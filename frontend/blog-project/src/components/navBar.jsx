import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSidebar } from "../context/SideBarContext.jsx";
import ProfilePictureUploader from "../pages/ProfilePictureUploader.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { toggleSidebar } = useSidebar();

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPictureUploader, setShowPictureUploader] = useState(false);
  const dropdownRef = useRef(null);

  // Define your server's base URL here
  const serverUrl = "http://localhost:5001";

  const defaultProfilePic =
    "https://via.placeholder.com/40/A78BFA/FFFFFF?text=U";

  // Apply theme on load and when toggled
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center relative z-10">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 mr-4"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="text-2xl font-bold text-blue-600 dark:text-blue-400"
          >
            MySocial
          </Link>
        </div>

        {/* Right: Auth & Theme */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              // Sun Icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12H5.25m-.386-6.364l1.591 1.591M12 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                />
              </svg>
            ) : (
              // Moon Icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 1.33 0 2.597-.266 3.752-.748Z"
                />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile button */}
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <img
                  src={
                    user?.profilePicture
                      ? `${serverUrl}${user.profilePicture}` // The new image URL will have the cache-busting `?t=...` added by AuthContext
                      : defaultProfilePic
                  }
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                />

                <span className="hidden md:inline font-medium">
                  {user?.firstName || "Profile"}
                </span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-20 animate-fadeIn">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowPictureUploader(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Change Picture
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="py-2 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition duration-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Profile Picture Uploader Modal */}
      {showPictureUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ProfilePictureUploader
            onClose={() => setShowPictureUploader(false)}
          />
        </div>
      )}
    </>
  );
};

export default Navbar;