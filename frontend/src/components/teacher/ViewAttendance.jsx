// import { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import apiClient from '../../services/apiClient'; // ✅ using apiClient

// const ViewAttendance = () => {
//   const [filters, setFilters] = useState({ subject: '', classroom: '', date: null });
//   const [attendance, setAttendance] = useState([]);
//   const [classrooms, setClassrooms] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         setLoading(true);
//         const [classRes, subRes] = await Promise.all([
//           apiClient.get('/get-classrooms'),
//           apiClient.get('/get-subjects')
//         ]);
//         setClassrooms(classRes.data?.data || []);
//         setSubjects(subRes.data?.data || []);
//       } catch (error) {
//         toast.error('Failed to load initial data');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   const fetchAttendance = async () => {

//     try {
//       setLoading(true);
//       const params = {
//         subjectId: filters.subject,
//         classroomId: filters.classroom,
//         ...(filters.date && { date: filters.date.toISOString().split('T')[0] })
//       };

//       const response = await apiClient.post('/attendance/records', params);
//       setAttendance(response.data?.data || []);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to fetch attendance');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'present' ? 'absent' : 'present';
//     try {
//       await apiClient.patch(`/attendance/update/${id}`, { status: newStatus });
//       setAttendance(attendance.map(record =>
//         record._id === id ? { ...record, status: newStatus } : record
//       ));
//       toast.success(`Status updated to ${newStatus}`);
//     } catch (error) {
//       toast.error('Failed to update attendance');
//     }
//   };

//   return (
//     <div className="p-4 max-w-6xl mx-auto">
//       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//         <h2 className="text-xl font-bold mb-4">Filter Attendance</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <select className="p-2 border rounded"
//             value={filters.classroom}
//             onChange={(e) => setFilters({ ...filters, classroom: e.target.value })}
//           >
//             <option value="">All Classrooms</option>
//             {classrooms.map(c => (
//               <option key={c.id} value={c.id}>{c.name}</option>
//             ))}
//           </select>
//           <select className="p-2 border rounded"
//             value={filters.subject}
//             onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
//           >
//             <option value="">All Subjects</option>
//             {subjects.map(s => (
//               <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
//             ))}
//           </select>
//           <DatePicker
//             selected={filters.date}
//             onChange={(date) => setFilters({ ...filters, date })}
//             className="p-2 border rounded w-full"
//             placeholderText="Select date"
//             dateFormat="yyyy-MM-dd"
//             isClearable
//           />
//         </div>
//         <button
//           onClick={fetchAttendance}
//           disabled={loading}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//         >
//           {loading ? 'Loading...' : 'Apply Filters'}
//         </button>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
//         {loading ? (
//           <div className="text-center">Loading...</div>
//         ) : attendance.length === 0 ? (
//           <div className="text-center text-gray-500">No records found</div>
//         ) : (
//           <table className="w-full text-sm text-left text-gray-600">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2">Student</th>
//                 <th className="p-2">Subject</th>
//                 <th className="p-2">Class</th>
//                 <th className="p-2">Date</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendance.map(record => (
//                 <tr key={record._id} className="border-b">
//                   <td className="p-2">{record.student?.fullName}</td>
//                   <td className="p-2">{record.subject?.name}</td>
//                   <td className="p-2">{record.classroom?.name}</td>
//                   <td className="p-2">{new Date(record.session?.date).toLocaleDateString()}</td>
//                   <td className="p-2">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                     }`}>
//                       {record.status}
//                     </span>
//                   </td>
//                   <td className="p-2">
//                     <button onClick={() => updateStatus(record._id, record.status)}
//                       className="text-blue-600 hover:underline"
//                     >
//                       Toggle
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewAttendance;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import apiClient from "../../services/apiClient";

const ViewAttendance = () => {
  const [filters, setFilters] = useState({
    subject: "",
    classroom: "",
    date: null,
  });
  const [attendance, setAttendance] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [classRes, subRes] = await Promise.all([
          apiClient.get("/get-classrooms"),
          apiClient.get("/get-subjects"),
        ]);
        setClassrooms(classRes.data?.data || []);
        setSubjects(subRes.data?.data || []);
      } catch (error) {
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchAttendance = async () => {
    if (!filters.subject || !filters.classroom) {
      toast.error("Please select both subject and classroom");
      return;
    }

    try {
      setLoading(true);
      const params = {
        subjectId: filters.subject,
        classroomId: filters.classroom,
      };

      if (filters.date) {
        // Convert to YYYY-MM-DD format
        const year = filters.date.getFullYear();
        const month = String(filters.date.getMonth() + 1).padStart(2, "0");
        const day = String(filters.date.getDate()).padStart(2, "0");
        params.date = `${year}-${month}-${day}`;
      }

      const response = await apiClient.post("/attendance/records", params);
      setAttendance(response.data?.data || []);

      if (response.data.count === 0) {
        toast.info("No attendance records found for selected filters");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch attendance";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "present" ? "absent" : "present";
    try {
      const response = await apiClient.patch(`/attendance/update/${id}`, {
        status: newStatus,
      });

      setAttendance(
        attendance.map((record) =>
          record.id === id
            ? {
                ...record,
                status: response.data.data.newStatus,
                verification: {
                  ...record.verification,
                  timestamp: response.data.data.updatedAt,
                },
              }
            : record
        )
      );

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update attendance"
      );
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Filter Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            className="p-2 border rounded"
            value={filters.classroom}
            onChange={(e) =>
              setFilters({ ...filters, classroom: e.target.value })
            }
            required
          >
            <option value="">Select Classroom</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded"
            value={filters.subject}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value })
            }
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <DatePicker
            selected={filters.date}
            onChange={(date) => setFilters({ ...filters, date })}
            className="p-2 border rounded w-full"
            placeholderText="Select date (optional)"
            dateFormat="yyyy-MM-dd"
            isClearable
          />
        </div>

        <button
          onClick={fetchAttendance}
          disabled={loading || !filters.subject || !filters.classroom}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Search Attendance"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Attendance Records</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : attendance.length === 0 ? (
          <div className="text-center text-gray-500">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Student</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Last Updated</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{record.student?.fullName || "N/A"}</td>
                    <td className="p-2">{record.subject?.name || "N/A"}</td>
                    <td className="p-2">{record.classroom?.name || "N/A"}</td>
                    <td className="p-2">
                      {record.session?.date
                        ? new Date(record.session.date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(
                        record.verification?.timestamp
                      ).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => updateStatus(record.id, record.status)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAttendance;
