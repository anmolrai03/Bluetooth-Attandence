import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}!`);
      // Navigation is handled in authContext after successful login
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2000')] bg-cover bg-center pt-16">
      <motion.div
        className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to access your dashboard</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition`}
              onChange={handleChange}
              value={formData.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 border ${
                errors.password ? 'border-red-500' : 'border-gray-200'
              } rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition`}
              onChange={handleChange}
              value={formData.password}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <LoadingSpinner size={6} color="white" />
            ) : (
              'Login'
            )}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-amber-500 hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;