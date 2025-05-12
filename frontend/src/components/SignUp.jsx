import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    className: ''
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await signup(formData);
    if (user) {
      navigate(`/${user.role}-dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=2000')] bg-cover bg-center pt-16">
      <motion.div
        className="w-full max-w-md mx-4 my-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BlueAttend</h1>
            <p className="text-gray-500">Create your account in minutes</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Role</label>
              <select
                name="role"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Class Name</label>
                <input
                  type="text"
                  name="className"
                  placeholder="CSE VI-B"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all"
          >
            Sign Up
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link to="/login" className="text-amber-500 hover:underline">Login</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignUp;
