import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/apiService";

// Create the AuthContext
const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component that wraps the app and manages authentication state
export const AuthProvider = ({ children }) => {
  // State for user details, loading status, and auth status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Run once on mount → check if user is already logged in (token in localStorage)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Fetch user profile using stored token
          const response = await apiService.getProfile();
          if (response.success) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // If token invalid → clear tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false); // Auth check finished
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        const { access, refresh, ...userData } = response.data;

        // Save tokens in localStorage
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        // Save user data to state
        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  // Register function (auto-logs in user after registration)
  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        // Automatically login with provided credentials
        const loginResult = await login({
          username: userData.username,
          password: userData.password,
        });
        return loginResult;
      } else {
        return { success: false, error: response.error };
      }
    } catch {
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout(); // Call API to invalidate session
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear state & tokens locally
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success) {
        setUser(response.data); // Update state with new profile data
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch {
      return {
        success: false,
        error: "Profile update failed. Please try again.",
      };
    }
  };

  // Values provided to the whole app
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
