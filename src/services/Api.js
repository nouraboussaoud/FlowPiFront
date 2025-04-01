import axios from 'axios';

// Create an axios instance with interceptors
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;