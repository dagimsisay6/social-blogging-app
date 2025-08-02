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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Will store user details (firstName, lastName, profilePicture, etc.)
  const [loading, setLoading] = useState(true); // To indicate if initial user data is being loaded

  // Function to load user data from the backend
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        // This endpoint will now return profilePicture, bio, etc.
        const res = await axios.get("/api/auth/profile");
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token"); // Clear invalid token
        delete axios.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setIsAuthenticated(false);
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
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      setUser(res.data.user); // The login response now includes profilePicture
      setIsAuthenticated(true);
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
    setIsAuthenticated(false);
    setUser(null);
  };

  // Provide the state and functions to children components
  const authContextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    loadUser, // In case you need to manually refresh user data
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
