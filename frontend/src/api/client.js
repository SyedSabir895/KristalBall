import axios from 'axios';

const TOKEN_KEY = 'mams_token';

// localStorage can throw (private mode, blocked storage) → never crash on it
export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

// Dev: '/api' goes through the Vite proxy. Prod: set VITE_API_URL=https://your-api/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expired / invalid → tell the app to log out (AuthProvider listens for this event)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// Backend always sends { error: '...' } → show that, else a generic message
export function errorMessage(err) {
  return err?.response?.data?.error || err?.message || 'Something went wrong';
}

export default api;
