import { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const AttendanceStatus = ({ record }) => {
  const [timeLeft, setTimeLeft] = useState(
    Math.floor((new Date(record.session.expiresAt) - new Date()) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        record.status === 'present' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {record.status === 'present' ? (
            <FiCheckCircle className="text-green-500 text-3xl" />
          ) : (
            <FiClock className="text-yellow-500 text-3xl" />
          )}
          <div>
            <h3 className="font-bold text-lg">
              {record.status === 'present' ? 'Attendance Verified' : 'Pending Verification'}
            </h3>
            <p className="text-sm">
              {record.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-500">Subject</p>
          <p>{record.subject?.name || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-medium text-gray-500">Classroom</p>
          <p>{record.classroom?.name || 'N/A'}</p>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-blue-800">Session ends in:</span>
          <span className="font-bold">{formatTime(timeLeft)}</span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ 
                width: `${Math.min(100, (timeLeft / (3 * 60)) * 100)}%`
            }}

          ></div>
        </div>
      </div>

      {!record.rssiValid && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
          <FiXCircle className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">
            Low signal strength (RSSI: {record.data?.rssi || 'N/A'} dBm). 
            Please move closer to the teacher.
          </p>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded transition-colors"
      >
        Scan Another Session
      </button>
    </div>
  );
};

export default AttendanceStatus;