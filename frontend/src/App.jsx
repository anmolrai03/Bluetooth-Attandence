import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/home';
import Login from './components/login';
import SignUp from './components/SignUp';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          <span className="text-indigo-500">Blue</span>Attend
        </Link>
        <div className="flex space-x-6 items-center">
          <button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full shadow hover:shadow-md transition-all">
            Scan QR Code
          </button>
          <Link to="/login" className="text-gray-600 hover:text-indigo-500 transition">Login</Link>
          <Link to="/SignUp" className="text-gray-600 hover:text-indigo-500 transition">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

const App = () => (
  <Router>
    <Navbar />
    <div className="pt-16"> {/* Add padding to prevent navbar overlap */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
      </Routes>
    </div>
  </Router>
);

export default App;