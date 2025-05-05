import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AcademicCapIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">AttendX</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-primary-600 hover:text-primary-800 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Modern Attendance Tracking
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl mx-auto text-xl text-gray-600"
          >
            Streamline classroom attendance with QR codes and proximity verification
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center space-x-4"
          >
            <Link
              to="/signup"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
            >
              Demo Login
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Key Features</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: <AcademicCapIcon className="h-12 w-12 text-primary-600" />,
                title: "QR Code Attendance",
                description: "Teachers generate session QR codes for quick student check-ins"
              },
              {
                icon: <UserGroupIcon className="h-12 w-12 text-primary-600" />,
                title: "Proximity Verification",
                description: "Prevents proxy attendance with simulated Bluetooth proximity checks"
              },
              {
                icon: <ChartBarIcon className="h-12 w-12 text-primary-600" />,
                title: "Real-time Analytics",
                description: "Track attendance trends and student participation over time"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-md text-center"
              >
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}