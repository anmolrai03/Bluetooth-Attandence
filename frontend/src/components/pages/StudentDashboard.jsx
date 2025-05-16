import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AttendanceService } from '../../services';
import QrScanner from 'qr-scanner';
import useBLE from '../../hooks/useBLE';
import React from 'react';
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error Boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600">Error in component</div>;
    }
    return this.props.children;
  }
}

const ScanAttendanceView = () => {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [currentRssi, setCurrentRssi] = useState(null);
  const { startScan, stopScan, verifyProximity } = useBLE();

  const handleScan = useCallback(async (qrData) => {
    try {
      const qrJson = JSON.parse(qrData);
      const { valid, rssi, message } = await verifyProximity(qrJson.deviceId);
      
      if (!valid) throw new Error(message);
      
      const response = await AttendanceService.verify(qrJson, rssi);
      toast.success(response.message);
      stopScanner();
    } catch (error) {
      toast.error(error.message || 'Verification failed');
      stopScanner();
    }
  }, [verifyProximity]);

  const startScanner = useCallback(async () => {
    try {
      const videoElem = document.getElementById('qr-video');
      if (!videoElem) return;

      const qrScanner = new QrScanner(
        videoElem,
        result => handleScan(result.data),
        { highlightScanRegion: true }
      );
      
      await qrScanner.start();
      setScanner(qrScanner);
      setScanning(true);
      startScan();
    } catch (err) {
      toast.error('Camera access denied or not available');
    }
  }, [handleScan, startScan]);

  const stopScanner = useCallback(() => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    if (typeof stopScan === 'function') {
      stopScan();
    }
    setScanning(false);
    setCurrentRssi(null);
  }, [scanner, stopScan]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <ErrorBoundary>
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span>Signal Strength:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentRssi >= -55 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {currentRssi || '--'} dBm
              </span>
            </div>

            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start QR Scanner
              </button>
            ) : (
              <>
                <div className="relative w-full h-64 bg-black rounded overflow-hidden">
                  <video 
                    id="qr-video"
                    className="w-full h-full object-cover"
                  ></video>
                  <div className="absolute inset-0 border-4 border-green-500 rounded pointer-events-none"></div>
                </div>
                <button
                  onClick={stopScanner}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Stop Scanner
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const AttendanceSummaryView = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await AttendanceService.getStudentSummary();
        setAttendance(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>
        
        {attendance ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Overall</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{attendance.overall.percentage}%</p>
                  <p className="text-sm text-gray-600">
                    {attendance.overall.presentCount} / {attendance.overall.totalClasses} classes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">By Subject</h3>
              <div className="space-y-4">
                {attendance.bySubject.map(subject => (
                  <div key={subject.subject._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{subject.subject.name}</h4>
                        <p className="text-sm text-gray-600">{subject.subject.code}</p>
                      </div>
                      <span className="text-lg font-bold">{subject.percentage}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          subject.percentage >= 75 ? 'bg-green-600' : 
                          subject.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No attendance records found</p>
        )}
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scan');

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
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
            className={`py-2 px-4 font-medium ${activeTab === 'scan' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('scan')}
          >
            Scan Attendance
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('summary')}
          >
            My Attendance
          </button>
        </div>

        {activeTab === 'scan' ? <ScanAttendanceView /> : <AttendanceSummaryView />}
      </main>
    </div>
  );
}