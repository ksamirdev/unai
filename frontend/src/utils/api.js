import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 404) {
      console.error('Route not found:', error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

// Test API connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API connection failed:', error.message);
    throw error;
  }
};

// ✅ AUTH API EXPORTS (Missing in your current file)
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getProfile: () => api.get('/auth/profile')
};

// ✅ IMAGE API EXPORTS (Missing in your current file)
export const imageAPI = {
  processImage: (formData) => api.post('/images/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getHistory: () => api.get('/images/history'),
  getDetection: (id) => api.get(`/images/detection/${id}`)
};

// ✅ USER API EXPORTS (Optional - for future use)
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadProfileImage: (formData) => api.post('/users/profile/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getStats: () => api.get('/users/stats')
};

// Export the main API instance
export { api };
export default api;
