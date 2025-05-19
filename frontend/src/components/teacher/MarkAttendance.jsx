// import { useState, useEffect } from 'react';
// import QRCode from 'react-qr-code';
// import { toast } from 'react-toastify';
// // import useBLE from '../../hooks/useBLE';
// import apiClient from '../../services/apiClient';

// const MarkAttendance = ({ classrooms, subjects }) => {


//   const [formData, setFormData] = useState({ classroom: '', subject: '' });
//   const [activeSession, setActiveSession] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(180);
//   // const { startAdvertising, stopAdvertising } = useBLE();


//   //start sesion api starts here.
//   const startSession = async () => {
//     try {
//       // await startAdvertising({ classroomId: formData.classroom, subjectId: formData.subject });

//       const response = await apiClient.post('/session/start', {
//         classroom: formData.classroom,
//         subject: formData.subject
//       });
      
//       if(response.data.success){

//         alert(response.data.message);
//         setActiveSession(response.data);
//         setTimeLeft(response.data.durationMinutes * 60);
//         toast.success('Session started! Bluetooth broadcasting active.');

//       } else{
//         alert(response.message);
//       }

      

//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to start session');
//       // await stopAdvertising();
//     }
//   };
//   //start session api ends here.

//   //terminate session api ends here.
//   const terminateSession = async () => {
//     try {
//       // await stopAdvertising();
//       const response = await apiClient.patch(`/session/terminate/${activeSession.sessionId}`);

//       if(response.status == 200){
//         alert(response.data.message);
//         setActiveSession(null);
//         toast.success('Session ended');
//       } else{
//         alert(response.data.message);
//       }
      
//     } catch (error) {
//       console.log("Termination erro", error);
//       toast.error('Failed to terminate session');
//     }
//   };
//   // terminate session api ends here

//   //timer logic starts here.
//   useEffect(() => {
//     let timer;
//     if (activeSession.status == 'active' && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
//     } else if (timeLeft === 0) {
//       terminateSession();
//     }
//     return () => clearInterval(timer);
//   }, [activeSession, timeLeft]);
//   //timer logic ends here.


//   const qrData = activeSession ? JSON.stringify({
//     sessionId: activeSession.sessionId,
//     classroom: formData.classroom,
//     subject: formData.subject,
//     expiresAt: activeSession.expiresAt,
//     token: activeSession.token
//   }) : '';

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       {!activeSession ? (
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-bold mb-4">Start Attendance Session</h2>


//           <div className="space-y-4">
//             <select
//               className="w-full p-2 border rounded"
//               value={formData.classroom}
//               onChange={(e) => setFormData({...formData, classroom: e.target.value})}
//               required
//             >
//               <option value="">Select Classroom</option>
//               {classrooms.map(c => (
//                 <option key={c._id} value={c._id}>{c.name}</option>
//               ))}
//             </select>


//             <select
//               className="w-full p-2 border rounded"
//               value={formData.subject}
//               onChange={(e) => setFormData({...formData, subject: e.target.value})}
//               required
//             >
//               <option value="">Select Subject</option>
//               {subjects.map(s => (
//                 <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
//               ))}
//             </select>


//             <button
//               onClick={startSession}
//               disabled={!formData.classroom || !formData.subject}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
//               <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
//                 {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
//               </span>
//               <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
//             </div>
//           </div>
//           <div className="flex flex-col items-center space-y-4">
//             <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg">
//               <QRCode value={qrData} size={200} level="H" />
//             </div>
//             <div className="text-center space-y-1">
//               <p className="font-medium text-lg">
//                 {classrooms.find(c => c._id === formData.classroom)?.name}
//               </p>
//               <p className="text-gray-600">
//                 {subjects.find(s => s._id === formData.subject)?.name}
//               </p>
//               <p className="text-sm text-gray-500">Scan this QR with student app</p>
//             </div>
//             <button
//               onClick={terminateSession}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//             >
//               End Session Early
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MarkAttendance;





import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

const MarkAttendance = ({ classrooms, subjects }) => {
  const [formData, setFormData] = useState({ classroom: '', subject: '' });
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const startSession = async () => {

    console.log(formData.classroom  , formData.subject);
    try {
      if (!formData.classroom || !formData.subject) {
        toast.error('Please select both classroom and subject');
        return;
      }

      

      const response = await apiClient.post('/session/start', {
        classroom: formData.classroom,
        subject: formData.subject
      });

      if (response.data.success) {
        setActiveSession(response.data);
        setTimeLeft(response.data.durationMinutes * 60);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start session');
    }
  };

  const terminateSession = async () => {
    try {
      const response = await apiClient.patch(`/session/terminate/${activeSession.sessionId}`);
      if (response.status === 200) {
        setActiveSession(null);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to terminate session');
    }
  };

  useEffect(() => {
    let timer;
    if (activeSession?.status === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      terminateSession();
    }
    return () => clearInterval(timer);
  }, [activeSession, timeLeft]);

  return (
    <div className="p-4 max-w-md mx-auto">
      {!activeSession ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Start Attendance Session</h2>
          <div className="space-y-4">
            <select
              className="w-full p-2 border rounded"
              value={formData.classroom}
              onChange={(e) => setFormData({...formData, classroom: e.target.value})}
              required
            >
              <option value="">Select Classroom</option>
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="w-full p-2 border rounded"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>

            <button
              onClick={startSession}
              disabled={!formData.classroom || !formData.subject}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Start Session
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Active Session</h2>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg">
              {activeSession.qrCodeImage && (
                <img 
                  src={activeSession.qrCodeImage} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-lg">
                {classrooms.find(c => c._id === formData.classroom)?.name}
              </p>
              <p className="text-gray-600">
                {subjects.find(s => s._id === formData.subject)?.name}
              </p>
              <p className="text-sm text-gray-500">Scan this QR with student app</p>
            </div>
            <button
              onClick={terminateSession}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              End Session Early
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;