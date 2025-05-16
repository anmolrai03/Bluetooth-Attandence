import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { toast } from 'react-toastify';
import useBLE from '../../hooks/useBLE';
import AttendanceStatus from './AttendanceStatus';
import apiClient from '../../services/apiClient'; // ✅ Use configured client

const ScanQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const { verifyProximity, rssiThreshold } = useBLE();

  const handleScan = async (result) => {
    if (result?.text && !scanResult) {
      try {
        setIsScanning(false);
        setScanResult(result.text);

        const qrData = JSON.parse(result.text);

        // ✅ Check if QR expired
        if (new Date(qrData.expiresAt) < new Date()) {
          throw new Error('QR code expired');
        }

        // ✅ Bluetooth proximity check
        const proximity = await verifyProximity(qrData.teacherDeviceId);
        if (!proximity.valid) {
          toast.warning(`Too far from teacher (RSSI: ${proximity.rssi})`);
        }

        // ✅ Submit attendance using apiClient
        const response = await apiClient.post('/attendance/verify', {
          qrCode: result.text,
          rssi: proximity.rssi
        });

        setAttendanceRecord(response.data);
        toast.success(response.data.message || 'Attendance recorded');
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        setIsScanning(true);
        setScanResult(null);
      }
    }
  };

  const handleError = (error) => {
    console.error('QR Scanner Error:', error);
    toast.error('Scanner error. Please try again.');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          {attendanceRecord ? 'Attendance Recorded' : 'Scan QR Code'}
        </h2>

        {attendanceRecord ? (
          <AttendanceStatus record={attendanceRecord} />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 text-center">
              <p>Position the QR code within the frame</p>
              <p>Must be within {rssiThreshold} dBm of teacher</p>
            </div>

            <div className="relative border-2 border-blue-400 rounded-lg overflow-hidden">
              {isScanning ? (
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={handleScan}
                  onError={handleError}
                  scanDelay={500}
                  className="w-full"
                />
              ) : (
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Processing...</p>
                </div>
              )}

              {/* Scanner frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-4 border-blue-500 rounded-lg w-64 h-64"></div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsScanning(true);
                setScanResult(null);
              }}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              {isScanning ? 'Cancel' : 'Resume Scanning'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScanQR;
