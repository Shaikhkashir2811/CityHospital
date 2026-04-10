import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

const api = axios.create({
  baseURL: backendUrl,
});

// Inside frontend/src/api/api.js

api.interceptors.request.use(
  (config) => {
    // Get whichever token key you are using (token or aToken)
    const token = localStorage.getItem('token') || localStorage.getItem('aToken');

    if (token) {
      // This matches your original 'Bearer' format exactly
      config.headers.Authorization = `Bearer ${token}`;
      
      // Also include this for backend middlewares looking for a 'token' header
      config.headers.token = token;
      config.headers.atoken = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, the token is likely invalid or expired
      localStorage.removeItem('aToken');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;