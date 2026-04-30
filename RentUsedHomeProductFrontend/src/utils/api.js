import axios from 'axios';

// IMPORTANT: For Android Emulator, localhost = 10.0.2.2
// For iOS Emulator, localhost = localhost
// For Physical Device, use your local machine's IP (e.g., 192.168.1.10)
export const API_URL = 'http://10.0.2.2:5256/api';
const baseURL = API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Optional: Add interceptors for Auth Tokens
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

export default api;
