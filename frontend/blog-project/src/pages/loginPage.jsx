import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Using inline SVGs for icons to avoid needing an external library
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const navigate = useNavigate();

  // The base URL for your backend API
  const API_URL = 'http://localhost:5001/api/auth';

  // State to manage form data, updated to use 'email' to match the backend
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // State to manage UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for form validation errors
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (validateForm()) {
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send only the data the backend expects: email and password
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Handle successful login
          console.log('Login successful:', data);
          // Store the JWT token from the backend in localStorage
          localStorage.setItem('token', data.token);
          setMessage('Login successful! Redirecting to dashboard...');

          // Redirect to dashboard after a delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // Handle server-side validation or other errors
          console.error('Login failed:', data.msg);
          setMessage(`Error: ${data.msg || 'An error occurred.'}`);
        }
      } catch (error) {
        console.error('Network error:', error);
        setMessage('Network error. Please try again later.');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // TODO: Implement Google OAuth flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-lg text-gray-600 mt-2">Log in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@example.com"
              className={`w-full p-3 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full p-3 rounded-lg border-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path d="M13.522 9.53a2.5 2.5 0 01-2.915 2.915A2.502 2.502 0 0110 12.5a2.5 2.5 0 01-2.915-2.915 2.502 2.502 0 012.915-2.915A2.502 2.502 0 0110 7.5c.348 0 .686.046 1.011.135L8.687 9.513l1.835 1.835.98-1.295z" />
                    <path fillRule="evenodd" d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zm11.378 1.956a6.002 6.002 0 00-6.72-.086L2.613 14.54l1.625-2.148L2.457 15.6l2.148-1.625L4.444 16.32l2.148-1.625 2.235 2.951-2.951-2.235zM10 16a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">Remember Me</label>
            </div>
            <a
              href="#"
              onClick={() => navigate('/reset-password')}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgotten password?
            </a>
          </div>

          {/* Log In Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

          {/* Display general message */}
          {message && (
            <p className="mt-4 text-center text-sm font-medium">
              {message}
            </p>
          )}
        </form>

        {/* Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google logo"
            className="h-5 w-5 mr-2"
          />
          Log In with your Google account
        </button>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-700">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 font-semibold hover:text-blue-800 transition-colors focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
