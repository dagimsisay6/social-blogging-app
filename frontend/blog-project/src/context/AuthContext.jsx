import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const res = await axios.get("/api/auth/profile");
        console.log("loadUser fetched profile:", res.data);

        // Append timestamp to bust cache for profile picture
        if (res.data.profilePicture) {
          res.data.profilePicture = `${
            res.data.profilePicture
          }?t=${Date.now()}`;
        }
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const receivedToken = res.data.token;

      localStorage.setItem("token", receivedToken);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${receivedToken}`;
      setToken(receivedToken);

      // Add timestamp to profile picture on login user object too
      if (res.data.user.profilePicture) {
        res.data.user.profilePicture = `${
          res.data.user.profilePicture
        }?t=${Date.now()}`;
      }
      setUser(res.data.user);
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

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, loading, login, logout, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
