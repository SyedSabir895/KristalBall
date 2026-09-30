import axios from 'axios';

const TOKEN_KEY = 'mams_token';

function safeStorage(action) {
  try {
    return action();
  } catch {
    return null;
  }
}

export const tokenStore = {
  get: () => safeStorage(() => localStorage.getItem(TOKEN_KEY)),
  set: (token) => safeStorage(() => localStorage.setItem(TOKEN_KEY, token)),
  clear: () => safeStorage(() => localStorage.removeItem(TOKEN_KEY)),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export function errorMessage(err) {
  const data = err?.response?.data;
  const candidates = [data?.error, data?.error?.message, data?.message, err?.message];
  return candidates.find((m) => typeof m === 'string' && m) || 'Something went wrong';
}

export default api;
