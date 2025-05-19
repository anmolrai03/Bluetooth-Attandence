import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AttendanceService } from "../../services";
import { FaChartPie, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const AttendanceSummaryView = () => {

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await AttendanceService.getStudentSummary();
        // console.log("attendacne" , data);
        // console.log("attendace 2" , data.data);
        if (data.success) {
          setAttendance(data.data);
          // console.log("data", data.data)
        } else {
          toast.error(data.message || "Failed to load attendance summary", {
            autoClose: 5000,
          });
        }
      } catch (error) {
        toast.error(error.message || "Error fetching attendance data", {
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <svg
          className="animate-spin h-10 w-10 mx-auto text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.3" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <FaChartPie className="mr-3 text-blue-600" /> Attendance Summary
      </h2>

      {attendance ? (
        <div className="space-y-10">
          {/* Overall Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <h3 className="font-semibold text-blue-800 mb-4">Total Classes</h3>
              <div className="flex items-center gap-4">
                <div className="bg-blue-200 p-3 rounded-lg">
                  <span className="text-3xl font-bold text-blue-600">
                    {attendance.overall.totalClasses}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Classroom: {attendance.overall.classroom?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <h3 className="font-semibold text-green-800 mb-4">Present Days</h3>
              <div className="flex items-center gap-4">
                <div className="bg-green-200 p-3 rounded-lg">
                  <span className="text-3xl font-bold text-green-600">
                    {attendance.overall.presentCount}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {attendance.overall.totalClasses - attendance.overall.presentCount} absences
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <h3 className="font-semibold text-purple-800 mb-4">Overall Percentage</h3>
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-300"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-purple-600"
                    strokeWidth="8"
                    strokeDasharray={`${attendance.overall.percentage * 2.51} 251`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-purple-700">
                  {attendance.overall.percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Subject-wise Breakdown */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Subject-wise Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {attendance.bySubject.map((subject) => (
                <div
                  key={subject.subject._id}
                  className="border border-gray-200 bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {subject.subject.name}
                      </h4>
                      <p className="text-sm text-gray-500">{subject.subject.code}</p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        subject.percentage >= 75
                          ? "text-green-600"
                          : subject.percentage >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {subject.percentage}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Present: {subject.presentCount}</span>
                      <span>Total: {subject.totalClasses}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          subject.percentage >= 75
                            ? "bg-green-600"
                            : subject.percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                <FaCheckCircle className="mr-2" /> Best Performing Subject
              </h3>
              {[...attendance.bySubject].sort((a, b) => b.percentage - a.percentage)[0] && (
                <div className="flex items-center gap-4">
                  <div className="bg-green-200 p-3 rounded-lg">
                    <span className="text-2xl font-bold text-green-600">🏆</span>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {[...attendance.bySubject].sort((a, b) => b.percentage - a.percentage)[0].subject.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {[...attendance.bySubject].sort((a, b) => b.percentage - a.percentage)[0].percentage}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-red-100 p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform">
              <h3 className="font-semibold text-red-800 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2" /> Needs Improvement
              </h3>
              {[...attendance.bySubject].sort((a, b) => a.percentage - b.percentage)[0] && (
                <div className="flex items-center gap-4">
                  <div className="bg-red-200 p-3 rounded-lg">
                    <span className="text-2xl font-bold text-red-600">📉</span>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {[...attendance.bySubject].sort((a, b) => a.percentage - b.percentage)[0].subject.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {[...attendance.bySubject].sort((a, b) => a.percentage - b.percentage)[0].percentage}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="w-20 h-20 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500 text-lg">No attendance records found</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummaryView;