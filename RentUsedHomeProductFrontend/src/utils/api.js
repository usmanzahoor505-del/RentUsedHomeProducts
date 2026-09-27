import axios from 'axios';

// USB ADB Reverse (localhost) is primary for zero-firewall instant connection
// Fallback to Wi-Fi IP if USB is disconnected
const LOCALHOST_HOST = 'localhost:5257';
const WIFI_HOST = '10.109.107.42:5257';

export const API_URL = `http://${LOCALHOST_HOST}/api`;
export const IMAGE_BASE_URL = `http://${LOCALHOST_HOST}`;

// Configure global axios defaults so EVERY screen (HomeScreen, AddProduct, etc.) gets timeout & fallback
axios.defaults.timeout = 5000; // 5-second strict timeout to prevent infinite loading spinners
axios.defaults.headers.common['Content-Type'] = 'application/json';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Global Request Interceptor: attach token
axios.interceptors.request.use(
  (config) => {
    if (authToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Response Interceptor: Seamless Auto-Fallback between USB (localhost) and Wi-Fi IP
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const isNetworkError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      (error.message && (error.message.includes('timeout') || error.message.includes('Network Error')));

    if (originalConfig && !originalConfig._retry && isNetworkError) {
      originalConfig._retry = true;
      if (originalConfig.url && originalConfig.url.includes(LOCALHOST_HOST)) {
        originalConfig.url = originalConfig.url.replace(LOCALHOST_HOST, WIFI_HOST);
        console.log(`[API Fallback] Retrying on Wi-Fi: ${originalConfig.url}`);
        return axios(originalConfig);
      } else if (originalConfig.url && originalConfig.url.includes(WIFI_HOST)) {
        originalConfig.url = originalConfig.url.replace(WIFI_HOST, LOCALHOST_HOST);
        console.log(`[API Fallback] Retrying on Localhost USB: ${originalConfig.url}`);
        return axios(originalConfig);
      }
    }
    return Promise.reject(error);
  }
);

// Dedicated instance pointing to API_URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
