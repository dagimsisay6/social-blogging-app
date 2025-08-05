import React from "react";
import { useNavigate } from "react-router-dom";
import welcomeIllustration from "../assets/rafiki.png";

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => navigate("/signup");
  const handleLogIn = () => navigate("/login");

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white flex items-center justify-center px-6 sm:px-12 transition-colors duration-300 md:ml-24 md:mt-16">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24">
        {/* Left column for desktop: Text + Buttons */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 w-full md:w-1/2 order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight">
            Welcome to Blog Bridge
          </h1>

          <div className="flex gap-6 text-lg text-gray-600 dark:text-gray-300">
            <span>Connect</span>
            <span>Share</span>
            <span>Grow</span>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
            <button
              onClick={handleLogIn}
              className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Log In
            </button>
            <button
              onClick={handleSignUp}
              className="w-full py-3 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 font-semibold border-2 border-blue-700 rounded-xl shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Right column for desktop / Bottom for mobile: Illustration */}
        <div className="flex flex-col items-center w-full md:w-1/2 order-1 md:order-2">
          <img
            src={welcomeIllustration}
            alt="Blog Bridge Illustration"
            className="max-w-sm sm:max-w-md w-full h-auto mb-8 md:mb-0"
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
