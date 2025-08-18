import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for image analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip token refresh for delete-account and logout endpoints
    if (originalRequest.url?.includes('/auth/delete-account/') || 
        originalRequest.url?.includes('/auth/logout/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Clear tokens and redirect on refresh failure
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token available
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
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
      // Ignore logout API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
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

  // Medical history endpoints
  getMedicalHistory: async () => {
    try {
      const response = await api.get('/medical/');
      console.log("history data:", response.data); // Fixed logging
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

  // Enhanced Analysis endpoints
  analyzeIngredients: async (imageFile, category) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('category', category);

      const response = await api.post('/analysis/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Extended timeout for analysis
      });

      // Handle the new backend response format
      const backendData = response.data;
      
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
        // Fallback for unexpected response format
        return { 
          success: true, 
          data: backendData,
          analysisStatus: 'unknown'
        };
      }

    } catch (error) {
      // Network or other errors
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


  // Fixed deleteAccount method
  deleteAccount: async () => {
    try {
      const response = await api.delete('/auth/delete-account/');
      
      // Account deleted successfully, clear tokens immediately
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      return { success: true, data: response.data };
    } catch (error) {
      // Clear tokens even on error (account might still be deleted)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Don't treat 401 as an error for delete account - account was likely deleted
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
