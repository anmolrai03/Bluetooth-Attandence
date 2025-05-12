// context/authContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set token globally
  const setAxiosAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setAxiosAuthToken(token);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login/`,
        credentials
      );

      const { token, user, message } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      setAxiosAuthToken(token);
      setUser(user);
      toast.success(message || 'Login successful!');
      return user;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || 'Login failed';
      toast.error(errorMsg);
      return null;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup/`,
        userData
      );

      const { token, user, message } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      setAxiosAuthToken(token);
      setUser(user);
      toast.success(message || 'Signup successful!');
      return user;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || 'Signup failed';
      toast.error(errorMsg);
      return null;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAxiosAuthToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const logoutSilently = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAxiosAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
