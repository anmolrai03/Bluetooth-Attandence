import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AttendanceSummaryView from "../student/AttendanceSummaryView";
import ScanAttendanceView from "../student/ScanAttendanceView";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan");

  useEffect(() => {
    if (user?.role !== "student") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
          <button
            onClick={logout}
            className="text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b-2 border-gray-200 mb-8">
          <button
            className={`py-3 px-6 font-semibold text-lg ${
              activeTab === "scan"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("scan")}
          >
            Scan Attendance
          </button>
          <button
            className={`py-3 px-6 font-semibold text-lg ${
              activeTab === "summary"
                ? "border-b-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("summary")}
          >
            My Attendance
          </button>
        </div>

        {activeTab === "scan" ? <ScanAttendanceView /> : <AttendanceSummaryView />}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}