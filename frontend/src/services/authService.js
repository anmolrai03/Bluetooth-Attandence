import apiClient from './apiClient';

export const AuthService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // Ensure this returns { token, user }
  },
  
  signup: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data; // Ensure this returns { token, user }
  },
  
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
};