import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ─── Request Interceptor: attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: auto-refresh token on 401 ────────────────────────
// FIX: Prevent infinite refresh loop that caused frequent logouts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const doLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_profile');
    // Use replace to prevent back-button loop
    window.location.replace('/login');
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the refresh endpoint itself failed → logout immediately (no loop)
      if (originalRequest.url?.includes('/login/refresh/') || 
          originalRequest.url?.includes('/logout/')) {
        doLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (!refreshToken) {
        isRefreshing = false;
        doLogout();
        return Promise.reject(error);
      }

      try {
        // Use raw axios (not the api instance) to avoid interceptor loop
        const res = await axios.post(
          `${API_URL}/api/accounts/login/refresh/`,
          { refresh: refreshToken },
          { timeout: 10000 }
        );
        const { access, refresh } = res.data;
        localStorage.setItem('access_token', access);
        // If server rotates refresh tokens, save the new one
        if (refresh) localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        doLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helper: unwrap paginated responses ─────────────────────────────────────
export const getList = async (url, params = {}) => {
  try {
    const res = await api.get(url, { params });
    // Handle DRF paginated response: { count, next, previous, results: [...] }
    if (res.data && typeof res.data === 'object' && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    // Handle direct array response
    if (Array.isArray(res.data)) {
      return res.data;
    }
    // Handle single object wrapped in results (rare but possible)
    if (res.data && res.data.results && !Array.isArray(res.data.results)) {
      return [res.data.results];
    }
    return [];
  } catch (error) {
    console.error(`API Error [GET ${url}]:`, error);
    return []; // Return empty array to prevent map errors in UI
  }
};

// ─── Helper: clean logout ────────────────────────────────────────────────────
export const logout = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      await api.post('/api/accounts/logout/', { refresh });
    }
  } catch (_) {
    // silently fail – we still clear tokens
  } finally {
    doLogout();
  }
};

export default api;
