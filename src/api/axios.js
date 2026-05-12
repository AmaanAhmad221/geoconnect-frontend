import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Warn in dev if env var is missing
if (!API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL is not set in .env file');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // ✅ 15 sec timeout — important for Render free tier wake-up
});

// ✅ Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {

    // No response — backend is down or sleeping (Render free tier)
    if (!error.response) {
      console.error('❌ Backend unreachable — may be waking up, retry in 30s');
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 401 — token expired or invalid → logout
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 403 — not enough permissions
    if (status === 403) {
      console.error('❌ Access denied — insufficient permissions');
      return Promise.reject(error);
    }

    // 500 — server error
    if (status === 500) {
      console.error('❌ Server error — check backend logs on Render');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;