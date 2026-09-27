import axios from 'axios';

// Active PC Wi-Fi IP and port
const WIFI_IP = '10.109.107.42';
const PORT = '5257';

export const API_URL = `http://${WIFI_IP}:${PORT}/api`;
export const IMAGE_BASE_URL = `http://${WIFI_IP}:${PORT}`;
const LOCAL_API_URL = `http://localhost:${PORT}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: auto-fallback between Wi-Fi IP and Localhost (USB ADB)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    if (
      originalConfig &&
      !originalConfig._retry &&
      (!error.response || error.code === 'ERR_NETWORK' || (error.message && error.message.includes('Network Error')))
    ) {
      originalConfig._retry = true;
      // Toggle between Wi-Fi and Localhost
      const isCurrentlyWifi = originalConfig.baseURL && originalConfig.baseURL.includes(WIFI_IP);
      originalConfig.baseURL = isCurrentlyWifi ? LOCAL_API_URL : API_URL;
      console.log(`[API Fallback] Switching baseURL to: ${originalConfig.baseURL}`);
      return api(originalConfig);
    }
    return Promise.reject(error);
  }
);

export default api;
