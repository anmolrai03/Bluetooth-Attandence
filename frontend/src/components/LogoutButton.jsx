import React from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const LogoutButton = ({ redirectTo = '/login', className = '' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Removes token + user
    navigate(redirectTo); // Redirect after logout
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${className}`}
    >
      <FiLogOut /> Logout
    </button>
  );
};

export default LogoutButton;
