import React, { useState } from 'react';
import { startSession, terminateSession } from '../services/sessionServices';
import { toast } from 'react-toastify';

const SessionManager = () => {
  const [qrCode, setQrCode] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  const classroomId = '6820e01f63482ed39e265d02'; // TODO: dynamic in future
  const subjectId = '6820e01e63482ed39e265cff';  // TODO: dynamic in future

  const handleStart = async () => {
    try {
      setLoading(true);
      const data = await startSession(classroomId, subjectId);
      setQrCode(data.qrCodeImage);
      setSessionId(data.sessionId);
      toast.success('Session started successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not start session.');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    try {
      setLoading(true);
      await terminateSession(sessionId);
      setQrCode(null);
      setSessionId('');
      toast.success('Session terminated!');
    } catch (err) {
      toast.error(err.message || 'Could not terminate session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <button
        onClick={handleStart}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded mr-2"
      >
        Start Session
      </button>
      <button
        onClick={handleTerminate}
        disabled={loading || !sessionId}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Terminate Session
      </button>

      {qrCode && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">QR Code:</h2>
          <img src={qrCode} alt="Session QR Code" className="w-48 h-48" />
        </div>
      )}
    </div>
  );
};

export default SessionManager;
