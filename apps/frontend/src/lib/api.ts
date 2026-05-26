import axios, { AxiosError } from 'axios';

// Resolve API base URL — handles both SSR (Docker network) and browser (relative)
function resolveApiUrl(): string {
  const isServer = typeof window === 'undefined';
  if (isServer) {
    const internal = process.env.API_URL_INTERNAL;
    if (internal && internal.trim()) return internal;
    return 'http://backend:4000/api';
  }
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && pub.trim()) return pub;
  return '/api';
}

export const API_URL = resolveApiUrl();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('accessToken');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

let refreshing = false;
let queue: Array<(t: string) => void> = [];

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original._retry && typeof window !== 'undefined') {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      if (refreshing) {
        return new Promise((resolve) => {
          queue.push((t) => {
            original.headers.Authorization = `Bearer ${t}`;
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        queue.forEach((fn) => fn(data.accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
