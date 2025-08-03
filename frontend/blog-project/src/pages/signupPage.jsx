import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Use the server URL from environment variables, defaulting to localhost
const serverUrl = import.meta.env.API_URL || "http://localhost:5001";

const SignUpPage = () => {
  const navigate = useNavigate();

  // State to manage form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  // State to manage UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form validation errors
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (validateForm()) {
      try {
        // Use the dynamic serverUrl for the API call
        const response = await fetch(`${serverUrl}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Only send the data that the backend API expects
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Handle successful signup
          setMessage("Signup successful! Redirecting to login...");
          console.log("Signup successful:", data);
          // Redirect to the login page after a delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          // Handle server-side validation or other errors
          console.error("Signup failed:", data.msg);
          setMessage(`Error: ${data.msg || "An error occurred."}`);
        }
      } catch (error) {
        console.error("Network error:", error);
        setMessage("Network error. Please try again later.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome!</h1>
          <p className="text-lg text-gray-600 mt-2">
            Sign up to join our community!
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className={`w-full p-3 rounded-lg border-2 ${errors.firstName ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className={`w-full p-3 rounded-lg border-2 ${errors.lastName ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@gmail.com"
              className={`w-full p-3 rounded-lg border-2 ${errors.email ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Create Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full p-3 rounded-lg border-2 ${errors.password ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-blue-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fillRule="evenodd"
                      d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zM10 16a6 6 0 100-12 6 6 0 000 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path d="M13.522 9.53a2.5 2.5 0 01-2.915 2.915A2.502 2.502 0 0110 12.5a2.5 2.5 0 01-2.915-2.915 2.502 2.502 0 012.915-2.915A2.502 2.502 0 0110 7.5c.348 0 .686.046 1.011.135L8.687 9.513l1.835 1.835.98-1.295z" />
                    <path
                      fillRule="evenodd"
                      d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zm11.378 1.956a6.002 6.002 0 00-6.72-.086L2.613 14.54l1.625-2.148L2.457 15.6l2.148-1.625L4.444 16.32l2.148-1.625 2.235 2.951-2.951-2.235zM10 16a6 6 0 100-12 6 6 0 000 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Should be 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full p-3 rounded-lg border-2 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:border-blue-500 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fillRule="evenodd"
                      d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zM10 16a6 6 0 100-12 6 6 0 000 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-400"
                  >
                    <path d="M13.522 9.53a2.5 2.5 0 01-2.915 2.915A2.502 2.502 0 0110 12.5a2.5 2.5 0 01-2.915-2.915 2.502 2.502 0 012.915-2.915A2.502 2.502 0 0110 7.5c.348 0 .686.046 1.011.135L8.687 9.513l1.835 1.835.98-1.295z" />
                    <path
                      fillRule="evenodd"
                      d="M.661 10C3.048 4.607 7.234 2.164 10 2.164s6.952 2.443 9.339 7.836c-2.387 5.393-6.573 7.836-9.339 7.836S3.048 15.393.661 10zm11.378 1.956a6.002 6.002 0 00-6.72-.086L2.613 14.54l1.625-2.148L2.457 15.6l2.148-1.625L4.444 16.32l2.148-1.625 2.235 2.951-2.951-2.235zM10 16a6 6 0 100-12 6 6 0 000 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Should be similar password
            </p>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-900">
              By clicking on 'Sign up', you're agreeing to the Chunky app{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Display general message */}
          {message && (
            <p className="mt-4 text-center text-sm font-medium">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
