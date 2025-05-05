import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import TeacherAttendanceView from "./pages/Attendance/TeacherAttendanceView";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import StudentAttendance from "./pages/Attendance/StudentAttendance";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={user ? (
            <Navigate to={user.role === "teacher" ? "/dashboard" : "/student"} />
          ) : (
            <Home />
          )} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Teacher Routes */}
        <Route
          path="/dashboard"
          element={
            user?.role === "teacher" ? (
              <TeacherDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            user?.role === "teacher" ? (
              <TeacherAttendanceView />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            user?.role === "student" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/student/attendance"
          element={
            user?.role === "student" ? (
              <StudentAttendance />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}