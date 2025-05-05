import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: "Student Portal",
      description: "Mark attendance with Bluetooth in seconds",
      icon: "🎓",
      bgColor: "from-purple-500 to-blue-500"
    },
    {
      title: "Teacher Dashboard",
      description: "Manage classes and track attendance in real-time",
      icon: "👩‍🏫",
      bgColor: "from-amber-500 to-orange-500"
    },
    {
      title: "Smart Analytics",
      description: "Generate reports and insights automatically",
      icon: "📊",
      bgColor: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/abstract-blue-geometric-shapes-background_1035-17545.jpg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
                BlueAttend
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Revolutionizing attendance with Bluetooth technology - faster, smarter, and more reliable.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/login" 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Login
              </Link>
              <Link 
                to="/SignUp" 
                className="px-8 py-3 bg-white text-indigo-700 border-2 border-indigo-200 rounded-full shadow-lg hover:bg-indigo-50 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-24">
        <motion.h2 
          className="text-3xl font-bold text-center text-gray-800 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Why Choose BlueAttend?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className={`h-3 bg-gradient-to-r ${feature.bgColor}`}></div>
              <div className="p-6 text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Attendance System?</h2>
          <Link 
            to="/SignUp" 
            className="inline-block px-8 py-3 bg-white text-indigo-700 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;