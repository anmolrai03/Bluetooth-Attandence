import { AuthProvider, useAuth } from '../context/authContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Admin {user?.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">User Management</h3>
              <p className="text-gray-600 mt-2">Manage all users and permissions</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">System Analytics</h3>
              <p className="text-gray-600 mt-2">View system-wide analytics</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Settings</h3>
              <p className="text-gray-600 mt-2">Configure system settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;