import axios from 'axios';

// TODO(backend): point this at the real Express API base URL via env var
// e.g. import.meta.env.VITE_API_BASE_URL
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gq_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO(backend): centralize 401 handling to trigger logout once real auth exists
    return Promise.reject(error);
  }
);

export default httpClient;
