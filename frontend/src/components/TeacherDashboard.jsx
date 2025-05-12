import { useAuth } from '../context/authContext';
import SessionManager from './sessionManager';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Welcome Box */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, Professor {user?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Classes</h3>
              <p className="text-gray-600 mt-2">Manage your classes and lectures</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Attendance</h3>
              <p className="text-gray-600 mt-2">Take attendance using QR code</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Reports</h3>
              <p className="text-gray-600 mt-2">Generate and export attendance reports</p>
            </div>
          </div>
        </div>

        {/* Session Manager QR Code Tool */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Start QR Attendance Session</h2>
          <SessionManager />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
