import { BrowserRouter as Router, Routes, Route, Navigate , Link} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import Home from './components/pages/home';
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import StudentDashboard from './components/pages/StudentDashboard';
import TeacherDashboard from './components/pages/TeacherDashboard';
import Navbar from './components/pages/navbar';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Simple NotFound component (add this to your components)
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-xl text-gray-600">Page not found</p>
    <Link 
      to="/" 
      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go Home
    </Link>
  </div>
);

// Simple Unauthorized component
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">403</h1>
    <p className="text-xl text-gray-600">You don't have permission to access this page</p>
    <Link 
      to="/" 
      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go Home
    </Link>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Routes */}
            <Route 
              path="/student-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Teacher Routes */}
            <Route 
              path="/teacher-dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
};

export default App;