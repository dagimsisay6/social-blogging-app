// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001";

// 1. Create the Auth Context
const AuthContext = createContext(null);

// 2. Create the Auth Provider Component
export const AuthProvider = ({ children }) => {
  // This state will now hold the full user object, including the token
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // A helper function to get the token, which can be stored separately
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Function to load user data from the backend
  const loadUser = useCallback(async () => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const res = await axios.get("/api/auth/profile");
        // Store the user's profile data along with the token in a single object
        setUser({ ...res.data, token });
      } catch (error) {
        console.error("Error loading user:", error.response?.data?.msg || error.message);
        logout();
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setUser(null);
    }
  }, []);

  // Effect to run loadUser once on component mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      // Separate the token from the rest of the user's data
      const { token, ...userData } = res.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store the combined user and token object in the state
      setUser({ ...userData, token });

      return { success: true, message: res.data.msg };
    } catch (error) {
      console.error("Login error:", error.response?.data?.msg || error.message);
      return {
        success: false,
        message: error.response?.data?.msg || "Login failed",
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null); // Set the entire user object to null
  };

  // Provide the state and functions to children components
  const authContextValue = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    logout,
    loadUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a Custom Hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};