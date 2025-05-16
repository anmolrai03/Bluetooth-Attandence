import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const SessionTimer = ({ 
  initialTime = 180, // 3 minutes in seconds
  onTimeEnd,
  onTerminate,
  sessionData,
  isActive
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timer logic
  useEffect(() => {
    let timer;
    
    if (isActive && isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            onTimeEnd?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, isRunning, timeLeft, onTimeEnd]);

  // Start/pause timer
  const toggleTimer = () => {
    if (timeLeft <= 0) return;
    setIsRunning(!isRunning);
  };

  // End session early
  const handleTerminate = () => {
    setIsRunning(false);
    onTerminate?.();
    toast.warning('Session terminated early');
  };

  // Calculate progress percentage
  const progressPercentage = (timeLeft / initialTime) * 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">
          {sessionData?.subject?.name || 'Current Session'}
        </h3>
        <span className="text-sm text-gray-500">
          {sessionData?.classroom?.name || ''}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Timer display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </span>
          <p className="text-xs text-gray-500 mt-1">Time remaining</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={toggleTimer}
            disabled={timeLeft <= 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isRunning 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${timeLeft <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={handleTerminate}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Session info */}
      {sessionData && (
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Started at:</span>{' '}
            {new Date(sessionData.createdAt).toLocaleTimeString()}
          </p>
          <p>
            <span className="font-medium">Expires at:</span>{' '}
            {new Date(sessionData.expiresAt).toLocaleTimeString()}
          </p>
          {sessionData.qrCodeImage && (
            <p className="text-green-600 font-medium">
              QR Code Active
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionTimer;