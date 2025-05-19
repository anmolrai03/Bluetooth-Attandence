import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import { 
  SessionService, 
  AttendanceService,
  UserService 
} from '../../services';

import MarkAttendance from '../teacher/MarkAttendance';
import ViewAttendance from '../teacher/ViewAttendance';

// const MarkAttendanceView = ({ classrooms = [], subjects = [] }) => {

//   const [formData, setFormData] = useState({
//     classroom: '',
//     subject: ''
//   });
//   const [activeSession, setActiveSession] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

//   const startSession = async () => {
//     try {
//       const session = await SessionService.start(formData);
//       setActiveSession(session);
//       setTimeLeft(180); // Reset timer
//       toast.success('Session started!');
//     } catch (error) {
//       toast.error(error.message || 'Failed to start session');
//     }
//   };

//   const terminateSession = async () => {
//     try {
//       await SessionService.terminate(activeSession.sessionId);
//       setActiveSession(null);
//       toast.success('Session ended');
//     } catch (error) {
//       toast.error(error.message || 'Failed to terminate session');
//     }
//   };

//   useEffect(() => {
//     let timer;
//     if (activeSession && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
//     } else if (timeLeft === 0) {
//       terminateSession();
//     }
//     return () => clearInterval(timer);
//   }, [activeSession, timeLeft]);

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       {!activeSession ? (
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-bold mb-4">Start New Session</h2>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
//               <select
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 value={formData.classroom}
//                 onChange={(e) => setFormData({...formData, classroom: e.target.value})}
//                 required
//               >
//                 <option value="">Select Classroom</option>
//                 {classrooms.map(c => (
//                   <option key={c._id} value={c._id}>{c.name}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//               <select
//                 className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//                 value={formData.subject}
//                 onChange={(e) => setFormData({...formData, subject: e.target.value})}
//                 required
//               >
//                 <option value="">Select Subject</option>
//                 {subjects.map(s => (
//                   <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
//                 ))}
//               </select>
//             </div>
            
//             <button
//               onClick={startSession}
//               disabled={!formData.classroom || !formData.subject}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400 transition-colors"
//             >
//               Start Session
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">Active Session</h2>
//             <div className="flex items-center space-x-2">
//               <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                 {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
//               </span>
//               <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
//             </div>
//           </div>
          
//           <div className="flex flex-col items-center space-y-4">
//             <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg">
//               <QRCode 
//                 value={JSON.stringify({
//                   t: activeSession.sessionId,
//                   s: formData.subject,
//                   c: formData.classroom,
//                   tk: activeSession.token,
//                   expiresAt: activeSession.expiresAt
//                 })}
//                 size={200}
//                 level="H"
//               />
//             </div>
            
//             <div className="text-center space-y-1">
//               <p className="font-medium text-lg">
//                 {classrooms.find(c => c._id === formData.classroom)?.name}
//               </p>
//               <p className="text-gray-600">
//                 {subjects.find(s => s._id === formData.subject)?.name}
//               </p>
//               <p className="text-sm text-gray-500">
//                 Students should scan this QR within 3 minutes
//               </p>
//             </div>
            
//             <button
//               onClick={terminateSession}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
//             >
//               End Session Early
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ViewAttendanceView = () => {
//   const [filters, setFilters] = useState({
//     subject: '',
//     classroom: '',
//     date: ''
//   });
//   const [attendance, setAttendance] = useState([]);
//   const [classrooms, setClassrooms] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [classrooms, subjects] = await Promise.all([
//           UserService.getClassrooms(),
//           UserService.getSubjects()
//         ]);
//         setClassrooms(classrooms);
//         setSubjects(subjects);
//       } catch (error) {
//         toast.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       const records = await AttendanceService.getRecords(filters);
//       setAttendance(records);
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'present' ? 'absent' : 'present';
//     try {
//       await AttendanceService.updateStatus(id, newStatus);
//       setAttendance(attendance.map(record => 
//         record._id === id ? { ...record, status: newStatus } : record
//       ));
//       toast.success(`Status updated to ${newStatus}`);
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="p-4">
//       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//         <h2 className="text-xl font-bold mb-4">Filter Attendance</h2>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Classroom</label>
//             <select
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//               value={filters.classroom}
//               onChange={(e) => setFilters({...filters, classroom: e.target.value})}
//             >
//               <option value="">All Classrooms</option>
//               {classrooms.map(c => (
//                 <option key={c._id} value={c._id}>{c.name}</option>
//               ))}
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//             <select
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//               value={filters.subject}
//               onChange={(e) => setFilters({...filters, subject: e.target.value})}
//             >
//               <option value="">All Subjects</option>
//               {subjects.map(s => (
//                 <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
//               ))}
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//             <input
//               type="date"
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//               value={filters.date}
//               onChange={(e) => setFilters({...filters, date: e.target.value})}
//             />
//           </div>

//           <div className="flex items-end">
//             <button
//               onClick={fetchAttendance}
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400 transition-colors"
//             >
//               {loading ? 'Loading...' : 'Apply Filters'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Attendance Records</h2>
//           {attendance.length > 0 && (
//             <span className="text-sm text-gray-500">
//               {attendance.length} records found
//             </span>
//           )}
//         </div>

//         {loading ? (
//           <div className="flex justify-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         ) : attendance.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No attendance records found for selected filters
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {attendance.map(record => (
//                   <tr key={record._id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="font-medium text-gray-900">{record.student?.fullName}</div>
//                       <div className="text-sm text-gray-500">{record.student?.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{record.subject?.name}</div>
//                       <div className="text-sm text-gray-500">{record.subject?.code}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {record.classroom?.name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(record.session?.date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                       }`}>
//                         {record.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => updateStatus(record._id, record.status)}
//                         className="text-blue-600 hover:text-blue-900 hover:underline"
//                       >
//                         Toggle Status
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mark');
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [classrooms, subjects] = await Promise.all([
          UserService.getClassrooms(),
          UserService.getSubjects()
        ]);
        setClassrooms(classrooms);
        setSubjects(subjects);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // console.log("teacher dashboard")
  // console.log("classrooms" , classrooms);
  // console.log("subject" , subjects);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'mark' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('mark')}
          >
            Mark Attendance
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'view' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('view')}
          >
            View Attendance
          </button>
        </div>

        {activeTab === 'mark' ? (
          <MarkAttendance classrooms={classrooms} subjects={subjects} />
        ) : (
          <ViewAttendance />
        )}
      </main>
    </div>
  );
}