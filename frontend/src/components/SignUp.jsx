import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [role, setRole] = useState('student');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=2000')] bg-cover bg-center">
      <motion.div
        className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Us Today</h2>
            <p className="text-gray-500">Create your account in minutes</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Register As</label>
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition" 
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition" 
            />
          </div>

          <button className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-3 rounded-lg font-semibold shadow hover:shadow-md transition-all mb-4">
            Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
          </button>

          <div className="text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-amber-500 font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;