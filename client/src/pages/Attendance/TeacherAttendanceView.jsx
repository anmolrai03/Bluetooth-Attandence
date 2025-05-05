import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/api';
import { motion } from 'framer-motion';
import { CalendarIcon, CheckIcon, XIcon } from '@heroicons/react/24/outline';

export default function TeacherAttendanceView() {
  const { user } = useAuth();
  const [className, setClassName] = useState('CS-A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await attendanceService.getClassAttendance({
        params: { className, date }
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      await attendanceService.updateAttendance(attendanceId, { status: newStatus });
      setAttendance(attendance.map(record => 
        record._id === attendanceId ? { ...record, status: newStatus } : record
      ));
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [className, date]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="CS-A">CS-A</option>
            <option value="CS-B">CS-B</option>
            <option value="IT-A">IT-A</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 pl-10"
            />
            <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">No attendance records found</td>
              </tr>
            ) : (
              attendance.map((record) => (
                <motion.tr 
                  key={record._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(record._id, 'present')}
                        className={`p-1 rounded-md ${
                          record.status === 'present' 
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(record._id, 'absent')}
                        className={`p-1 rounded-md ${
                          record.status === 'absent' 
                            ? 'bg-red-100 text-red-600' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}