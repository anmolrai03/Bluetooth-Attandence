import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/api';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceService.getStudentAttendanceSummary();
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendance();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (!attendanceData) return <div className="text-center py-8">No attendance data found</div>;

  // Chart data for overall attendance
  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [
          attendanceData.overall.presentClasses,
          attendanceData.overall.totalClasses - attendanceData.overall.presentClasses
        ],
        backgroundColor: ['#0ea5e9', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Attendance</h1>
      
      {/* Overall Attendance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4">Overall Attendance</h2>
        <div className="flex items-center justify-between">
          <div className="w-32 h-32">
            <Doughnut 
              data={chartData} 
              options={{ cutout: '70%' }}
            />
          </div>
          <div className="flex-1 ml-8">
            <div className="text-4xl font-bold text-primary-600">
              {attendanceData.overall.attendancePercentage.toFixed(1)}%
            </div>
            <div className="text-gray-600 mt-2">
              {attendanceData.overall.presentClasses} of {attendanceData.overall.totalClasses} classes attended
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subject-wise Attendance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">By Subject</h2>
        {attendanceData.bySubject.map((subject) => (
          <motion.div
            key={subject.subjectId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">{subject.subjectName}</h3>
              <p className="text-sm text-gray-600">{subject.className}</p>
            </div>
            <div className="text-right">
              <div className={`font-bold ${
                subject.attendancePercentage >= 75 ? 'text-green-600' : 
                subject.attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {subject.attendancePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {subject.presentClasses}/{subject.totalClasses}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}