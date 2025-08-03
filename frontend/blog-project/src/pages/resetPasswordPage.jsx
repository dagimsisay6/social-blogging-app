import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const API_URL = 'https://social-blogging-app-1-5k7h.onrender.com/api/auth';

  // State to manage the two steps of the form
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // State for the new password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes for both forms
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  // Handle the first form submission (email verification)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Email is required.');
      setLoading(false);
      return;
    }

    try {
      // New backend route to simply verify the email exists
      const response = await fetch(`${API_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSubmitted(true); // Show the next form
        setMessage('Email verified. Please enter your new password.');
      } else {
        const data = await response.json();
        setErrorMessage(data.msg || 'User not found with that email.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle the second form submission (password reset)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // New backend route to update the password directly
      const response = await fetch(`${API_URL}/reset-password-unsecured`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.msg || 'Password updated successfully. You will now be redirected to login.');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after a delay
        }, 3000);
      } else {
        setErrorMessage(data.msg || 'Failed to update password. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Reset password</h1>
          <p className="text-lg text-gray-600 mt-2">
            {!emailSubmitted ? 'Enter your email to get started.' : 'Enter your new password below.'}
          </p>
        </div>

        {/* --- Form for Step 1: Email Verification --- */}
        {!emailSubmitted && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="johndoe@gmail.com"
                className={`w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors`}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}

        {/* --- Form for Step 2: Password Reset --- */}
        {emailSubmitted && (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter new password"
                className={`w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors`}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className={`w-full p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors`}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* Display success and error messages */}
        {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600">
            {message}
          </p>
        )}
        {errorMessage && (
          <p className="mt-4 text-center text-sm font-medium text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
