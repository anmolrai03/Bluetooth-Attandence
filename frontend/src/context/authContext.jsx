import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = sessionStorage.getItem('token');
      const userData = sessionStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Failed to parse user data:', error);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user } = await AuthService.login(credentials);
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      // Store in sessionStorage
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Redirect based on role
      const redirectPath = user.role === 'teacher' 
        ? '/teacher-dashboard' 
        : '/student-dashboard';
      navigate(redirectPath);
      
      toast.success(`Welcome back, ${user.name}!`);
      return user;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const { token, user } = await AuthService.signup(userData);
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      const redirectPath = user.role === 'teacher'
        ? '/teacher-dashboard'
        : '/student-dashboard';
      navigate(redirectPath);
      
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: If you have a logout API endpoint
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};