import React from 'react';
import { useNavigate } from 'react-router-dom';
import welcomeIllustration from '../assets/rafiki.png';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogIn = () => {
    navigate('/login');
  };

  return (
    // This container centers all content vertically and horizontally on the page.
    // It uses min-h-screen to ensure it takes up at least the full viewport height.
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white sm:p-10">

      {/* This inner container holds both the text/image and the buttons.
          We give it a max-width for larger screens to prevent it from stretching too wide.
          The gap-8 class adds consistent spacing between the main sections. */}
      <div className="flex flex-col items-center max-w-sm w-full text-center gap-8">

        {/* Top Section: Text and Illustration */}
        <div className="flex flex-col items-center w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Blog Bridge</h1>
          <div className="flex gap-4 text-lg text-gray-600 mb-10">
            <span>Connect</span>
            <span>Share</span>
            <span>Grow</span>
          </div>
          <div className="w-full">
            <img
              src={welcomeIllustration}
              alt="Blog Bridge Illustration"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Bottom Section: Buttons */}
        <div className="w-full flex flex-col gap-4">
          <button
            onClick={handleSignUp}
            className="w-full py-4 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign up
          </button>
          <button
            onClick={handleLogIn}
            className="w-full py-4 bg-white text-blue-700 font-semibold border-2 border-blue-700 rounded-xl shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Log In
          </button>
        </div>

      </div>
    </div>
  );
};

export default WelcomePage;