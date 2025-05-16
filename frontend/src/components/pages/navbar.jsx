import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
// import LogoutButton from './LogoutButton';

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const { user } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">BlueAttend</Link>
        
        <div className="flex space-x-4 items-center">
          {/* Optional QR scan button (students) */}
          {user?.role === 'student' && (
            <Link to="/student-dashboard">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded shadow transition">
                Scan QR Code
              </button>
            </Link>
          )}

          {/* Show Login/Signup only if not logged in and not on login/signup pages */}
          {!user && !isAuthPage && (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}

          {/* Show logout if user is logged in
          {user && (
            <LogoutButton className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded" />
          )} */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
