import axios from 'axios';

// In dev, Vite proxies /api to http://localhost:5000 (see vite.config.js).
// In production, set VITE_API_URL to your deployed backend URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// Helper to build a full image URL from a relative /uploads path returned by the API.
export function imageUrl(path) {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  const apiOrigin = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : '';
  return `${apiOrigin}${path}`;
}

export default api;
