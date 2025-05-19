import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor with enhanced error handling
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      // Ensure we still return a config even if interceptor fails
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    try {
      // You can add any response transformation here if needed
      return response;
    } catch (error) {
      console.error('Error processing successful response:', error);
      return response; // Return the original response if processing fails
    }
  },
  (error) => {
    try {
      console.error("API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      if (error.response) {
        if (error.response.status === 401) {
          // Optionally, redirect to login or clear session
          window.location.href = '/login';
        } else if (error.response.status === 403) {
          // Optionally, show forbidden message
          window.location.href ='/unauthorized'
        } else if (error.response.status === 404) {
          // Optionally, show not found message
          // alert('Resource not found.');
        } else if (error.response.status === 500) {
          // Optionally, show server error message
          alert('Server error. Please try again later.');
        }
      }

      return Promise.reject({
        message: error.message || 'Network Error',
        data: error.response?.data,
        status: error.response?.status,
        originalError: error
      });
    } catch (interceptorError) {
      console.error('Error in response interceptor error handler:', interceptorError);
      return Promise.reject(error); 
    }
  }
);

export default apiClient;