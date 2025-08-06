import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSidebar } from "../context/SideBarContext.jsx";
import ProfilePictureUploader from "../pages/ProfilePictureUploader.jsx";
import { Menu, Sun, Moon, UserRound, ChevronDown } from "lucide-react";
import blogBridgeLogo from "./../assets/icon.jpg";

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

  const serverUrl = "https://social-blogging-app-1-5k7h.onrender.com";

  // Apply dark mode to the whole page
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Change the body background for full-screen dark effect
    document.body.classList.toggle("bg-gray-900", isDarkMode);
    document.body.classList.toggle("bg-white", !isDarkMode);
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

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
      <nav
        className="
          bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center
          fixed top-0 z-10 transition-all duration-300
          w-full lg:w-[calc(100%-5rem)]
          lg:left-[5rem]
        "
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 mr-3"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-7 w-7" />
          </button>

          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center space-x-2"
          >
            <img
              src={blogBridgeLogo}
              alt="Blog Bridge Logo"
              className="h-8 w-auto rounded-full"
            />
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Blog Bridge
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark mode toggle button */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {user?.profilePicture ? (
                  <img
                    src={`${serverUrl}${user.profilePicture}?t=${Date.now()}`}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <UserRound
                    className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-1"
                    size={28}
                  />
                )}

                <span className="hidden md:inline font-medium">
                  {user?.firstName || "Profile"}
                </span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

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
