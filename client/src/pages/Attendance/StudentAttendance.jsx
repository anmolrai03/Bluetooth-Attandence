import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  SignalIcon, 
  QrCodeIcon 
} from '@heroicons/react/24/outline';
import QrScannerComponent from '../../components/qr/QrScanner';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [proximityStatus, setProximityStatus] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [rssiValue, setRssiValue] = useState(null);

  const checkProximity = () => {
    const simulatedRSSI = Math.floor(Math.random() * 40) - 90; // -90 to -50
    setRssiValue(simulatedRSSI);
    
    if (simulatedRSSI > -70) {
      setProximityStatus("success");
      return true;
    } else {
      setProximityStatus("error");
      return false;
    }
  };

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data);
      setShowScanner(false);
      
      if (checkProximity()) {
        try {
          await attendanceService.markAttendance({ sessionId: data });
          setAttendanceStatus("success");
        } catch (error) {
          console.error('Attendance failed:', error);
        }
      }
    }
  };

  const resetProcess = () => {
    setScanResult(null);
    setProximityStatus(null);
    setAttendanceStatus(null);
    setRssiValue(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Main attendance flow with scanner */}
      {showScanner && (
        <QrScannerComponent 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}