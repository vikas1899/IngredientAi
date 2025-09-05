import axios from 'axios';

// Base URL for API (from environment variable or fallback to localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Create a reusable axios instance with default settings
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout to handle heavy requests like image analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

/* -------------------------------
   Request Interceptor
   - Attaches Authorization header with JWT access token (if available)
--------------------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------
   Response Interceptor
   - Handles automatic token refresh when access token expires (401 error)
   - Skips refresh for logout/delete-account endpoints
--------------------------------- */
api.interceptors.response.use(
  (response) => response,
  
  async (error) => {
    const originalRequest = error.config;

    // Do not try refreshing for account deletion or logout requests
    if (originalRequest.url?.includes('/auth/delete-account/') || 
        originalRequest.url?.includes('/auth/logout/')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Request a new access token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);

        } catch (refreshError) {
          // Refresh failed → clear tokens & redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token available → force login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/* -------------------------------
   API Service Layer
   - Exposes functions for auth, user profile, medical history,
     ingredient analysis, and account management
--------------------------------- */
export const apiService = {
  /* -------- AUTH ENDPOINTS -------- */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Ignore logout API errors but log them
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    return { success: true };
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch profile' 
      };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to update profile' 
      };
    }
  },

  /* -------- MEDICAL HISTORY ENDPOINTS -------- */
  getMedicalHistory: async () => {
    try {
      const response = await api.get('/medical/');
      console.log("history data:", response.data); // Debug logging
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch medical history' 
      };
    }
  },

  checkMedicalHistory: async () => {
    try {
      const response = await api.get('/medical/check/');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check medical history' 
      };
    }
  },

  createMedicalHistory: async (data) => {
    try {
      const response = await api.post('/medical/', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to create medical history' 
      };
    }
  },

  updateMedicalHistory: async (data) => {
    try {
      const response = await api.put('/medical/', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Failed to update medical history' 
      };
    }
  },

  /* -------- INGREDIENT ANALYSIS ENDPOINTS -------- */
  analyzeIngredients: async (imageFile, category) => {
    try {
      // Send image and category as multipart form data
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('category', category);

      const response = await api.post('/analysis/analyze/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // Extended timeout for heavy analysis
      });

      const backendData = response.data;

      // Handle expected backend response format
      if (backendData.status === 'successful') {
        return { 
          success: true, 
          data: backendData,
          analysisStatus: 'successful',
          hasProcessingError: backendData.analysis?.result?.no_valid_ingredients || false
        };
      } else if (backendData.status === 'failed') {
        return { 
          success: false, 
          error: backendData.error || 'Analysis failed',
          analysisStatus: 'failed'
        };
      } else {
        // Unexpected format → treat as unknown
        return { 
          success: true, 
          data: backendData,
          analysisStatus: 'unknown'
        };
      }

    } catch (error) {
      // Handle network or server errors
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               'Analysis failed - network error',
        analysisStatus: 'failed'
      };
    }
  },

  getAnalysisHistory: async (page = 1) => {
    try {
      const response = await api.get(`/analysis/history/?page=${page}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch analysis history' 
      };
    }
  },

  getAnalysisDetails: async (id) => {
    try {
      const response = await api.get(`/analysis/history/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch analysis details' 
      };
    }
  },

  deleteAnalysis: async (id) => {
    try {
      const response = await api.delete(`/analysis/history/${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete analysis' 
      };
    }
  },

  /* -------- ACCOUNT MANAGEMENT -------- */
  deleteAccount: async () => {
    try {
      const response = await api.delete('/auth/delete-account/');
      
      // Always clear tokens after account deletion
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      return { success: true, data: response.data };
    } catch (error) {
      // Clear tokens even if request fails (account might be deleted anyway)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Treat 401 as success (account no longer exists)
      if (error.response?.status === 401) {
        return { success: true, message: 'Account deleted successfully' };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete account' 
      };
    }
  },
};

export default apiService;
