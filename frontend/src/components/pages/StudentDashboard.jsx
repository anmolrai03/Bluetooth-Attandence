import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
// import axios from 'axios';
import { toast } from "react-toastify";
import { AttendanceService } from "../../services";
import QrScanner from "qr-scanner";
import useBLE from "../../hooks/useBLE";

import { QrReader } from "react-qr-reader";
// import { isMobile } from "react-device-detect";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
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

//Scan Attendance Section starts here.

// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import QrScanner from 'qr-scanner'; // Assuming this is the library used
// import { QrReader } from 'react-qr-reader'; // Assuming this is the component used
// import { toast } from 'react-toastify'; // Assuming toast library
// import { AttendanceService } from '../services/AttendanceService'; // Your service
// import { useBLE } from '../hooks/useBLE'; // Your BLE hook

const ScanAttendanceView = () => {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState("camera");
  const [qrData, setQrData] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [customCameraUrl, setCustomCameraUrl] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [generatedRssi, setGeneratedRssi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentRssi } = useBLE();
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Generate demo RSSI between -75 and -35
  const generateDemoRssi = () => {
    const rssi = Math.floor(Math.random() * (-35 - -75 + 1) + -75);
    setGeneratedRssi(rssi);
    return rssi;
  };

  // Validate DroidCam URL
  const validateDroidCamUrl = (url) => {
    const urlPattern =
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\/video$/;
    return urlPattern.test(url);
  };

  // Handle DroidCam Connect
  const handleDroidCamConnect = () => {
    if (!customCameraUrl) {
      toast.error("Please enter a DroidCam URL");
      return;
    }
    if (!validateDroidCamUrl(customCameraUrl)) {
      toast.error("Invalid DroidCam URL format");
      return;
    }
    toast.success("Connected to DroidCam");
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);

      // Decode QR code
      const result = await QrScanner.scanImage(file);
      const parsedData = JSON.parse(result);

      // Validate QR format
      if (!parsedData.t || !parsedData.s || !parsedData.c || !parsedData.tk) {
        throw new Error("Invalid QR code format");
      }

      setQrData(parsedData);
    } catch (error) {
      setError(error.message || "Failed to read QR code");
      toast.error(error.message || "Failed to read QR code");
      setFilePreview(null);
      setQrData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle QR scan from camera
  const handleQrScan = (result) => {
    if (result) {
      try {
        const parsedData = JSON.parse(result.text);
        if (!parsedData.t || !parsedData.s || !parsedData.c || !parsedData.tk) {
          throw new Error("Invalid QR code format");
        }
        setQrData(parsedData);
        toast.success("QR code scanned successfully");
      } catch (error) {
        setError(error.message || "Failed to read QR code");
        toast.error(error.message || "Failed to read QR code");
        setQrData(null);
      }
    }
  };

  // Handle attendance verification
  const handleVerify = useCallback(async () => {
    if (!qrData) {
      alert("❌ Error: No QR data detected! Please scan a valid QR code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rssi = demoMode ? generatedRssi : -55;
      const response = await AttendanceService.verify(qrData, rssi);

      // Handle success response
      if (response.success) {
        const successMessage =
          response.data?.message ||
          response.message ||
          "Attendance recorded successfully!";
        const details =
          `Status: ${response.data?.status || "present"}\n` +
          `Subject: ${response.data?.subject || "N/A"}\n` +
          `Classroom: ${response.data?.classroom || "N/A"}\n` +
          `Time: ${
            response.data?.timestamp
              ? new Date(response.data.timestamp).toLocaleString()
              : ""
          }`;

        // Show toast first
        if (typeof toast.success === "function") {
          toast.success(successMessage, { autoClose: 3000 });
        } else {
          alert(`✅ Success!\n${successMessage}`);
        }

        // Show detailed alert
        alert(`✅ Attendance Verified!\n\n${details}`);

        setTimeout(() => navigate("/attendance"), 2000);
      } else {
        // Handle backend-reported errors with messages
        const errorMessage =
          response.data?.message ||
          response.message ||
          "Attendance verification failed";
        showErrorMessage(errorMessage);
      }
    } catch (error) {
      // Handle axios error structure
      const backendMessage = error.response?.data?.message;
      const statusMessage = error.response?.statusText;
      const statusCode = error.response?.status;

      // Construct meaningful error message
      const errorMessage =
        backendMessage ||
        statusMessage ||
        error.message ||
        "Failed to verify attendance";

      // Special handling for 409 Conflict
      if (statusCode === 409) {
        showErrorMessage(
          `⚠ Already Recorded!\n${
            backendMessage || "Attendance already exists for this session"
          }`
        );
      } else {
        showErrorMessage(`⚠ Error ${statusCode || ""}\n${errorMessage}`);
      }

      // Reset state
      setQrData(null);
      setFilePreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [qrData, demoMode, generatedRssi, navigate]);

  // Helper function for consistent error display
  const showErrorMessage = (message) => {
    if (typeof toast.error === "function") {
      toast.error(message, {
        autoClose: 5000,
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      alert(message);
    }
  };

  // const handleVerify = useCallback(async () => {
  //   if (!qrData) {
  //     alert("No QR data detected! Please scan a valid QR code");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const rssi = demoMode ? generatedRssi : -55; // Use actual RSSI or demo value
  //     const response = await AttendanceService.verify(qrData, rssi);

  //     // Handle success response
  //     if (response.success) {
  //       const successMessage =
  //         response.message || "Attendance recorded successfully!";

  //       // Try toast first
  //       if (typeof toast.success === "function") {
  //         toast.success(successMessage, { autoClose: 3000 });
  //       } else {
  //         alert(`✓ Success: ${successMessage}`);
  //       }

  //       // Show detailed alert
  //       alert(`Attendance marked as ${response.data?.status || "present"}!\n
  //       Time: ${new Date(response.data?.timestamp).toLocaleString() || ""}`);

  //       // Navigate after 2 seconds
  //       // setTimeout(() => navigate("/attendance"), 2000);
  //     }
  //     // Handle backend-reported failure
  //     else {
  //       const errorMessage =
  //         response.message || "Attendance verification failed";
  //       const fullMessage = `${errorMessage}\n${
  //         response.data?.message || ""
  //       }`.trim();

  //       if (typeof toast.error === "function") {
  //         toast.error(fullMessage, { autoClose: 5000 });
  //       } else {
  //         alert(`⚠ Error: ${fullMessage}`);
  //       }
  //     }
  //   } catch (error) {
  //     // Handle different error types
  //     let errorMessage = "Failed to verify attendance";

  //     if (error.response) {
  //       // Backend returned error response
  //       errorMessage =
  //         error.response.data?.message ||
  //         error.response.data?.error ||
  //         error.response.statusText;
  //     } else if (error.request) {
  //       // No response received
  //       errorMessage = "Network error - Could not connect to server";
  //     } else {
  //       // Frontend error
  //       errorMessage = error.message || error.toString();
  //     }

  //     // Display error
  //     if (typeof toast.error === "function") {
  //       toast.error(errorMessage, { autoClose: false });
  //     } else {
  //       alert(`⚠ Error: ${errorMessage}`);
  //     }

  //     // Reset state
  //     setQrData(null);
  //     setFilePreview(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [qrData, demoMode, generatedRssi, navigate]);

  // Handle retry
  const handleRetry = () => {
    setQrData(null);
    setFilePreview(null);
    setError(null);
    setCustomCameraUrl("");
    setInputMethod("camera");
  };

  // Cleanup file preview
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

        {/* Input Method Selection */}
        <div className="mb-4 flex gap-2">
          {!isMobile && (
            <button
              onClick={() => setInputMethod("camera")}
              className={`px-4 py-2 rounded ${
                inputMethod === "camera"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              disabled={isLoading}
            >
              Camera
            </button>
          )}
          <button
            onClick={() => setInputMethod("upload")}
            className={`px-4 py-2 rounded ${
              inputMethod === "upload"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            disabled={isLoading}
          >
            Upload QR
          </button>
          <button
            onClick={() => setInputMethod("droidcam")}
            className={`px-4 py-2 rounded ${
              inputMethod === "droidcam"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            disabled={isLoading}
          >
            DroidCam
          </button>
        </div>

        {/* DroidCam URL Input */}
        {inputMethod === "droidcam" && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Enter DroidCam URL (e.g., http://192.168.1.2:4747/video)"
              className="w-full p-2 border rounded"
              value={customCameraUrl}
              onChange={(e) => setCustomCameraUrl(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleDroidCamConnect}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              Connect
            </button>
          </div>
        )}

        {/* Demo Mode Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              disabled={isLoading}
            />
            <span>Demo Mode (Random RSSI)</span>
          </label>
        </div>

        {/* Signal Strength */}
        <div className="flex items-center space-x-4 mb-4">
          <span>Signal Strength:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              (demoMode ? generatedRssi : currentRssi) >= -55
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {demoMode ? generatedRssi : currentRssi || "--"} dBm
          </span>
          {demoMode && (
            <button
              onClick={generateDemoRssi}
              className="text-blue-600 hover:text-blue-800"
              disabled={isLoading}
            >
              Regenerate RSSI
            </button>
          )}
        </div>

        {/* Camera Input */}
        {inputMethod === "camera" && (
          <div className="relative w-full h-64 bg-black rounded overflow-hidden">
            <QrReader
              constraints={{
                facingMode: "environment",
                ...(customCameraUrl && { deviceId: customCameraUrl }),
              }}
              onResult={handleQrScan}
              scanDelay={500}
              className="w-full h-full"
            />
            sóng{" "}
            <div className="absolute inset-0 border-4 border-green-500 rounded pointer-events-none" />
          </div>
        )}

        {/* File Upload Input */}
        {inputMethod === "upload" && (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-upload"
              disabled={isLoading}
            />
            <label
              htmlFor="qr-upload"
              className={`block w-full py-2 px-4 bg-blue-600 text-white rounded text-center cursor-pointer ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Processing..." : "Upload QR Image"}
            </label>

            {filePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={filePreview}
                  alt="QR Preview"
                  className="max-w-xs mx-auto border rounded-lg p-2"
                />
              </div>
            )}
          </div>
        )}

        {/* QR Data Display and Submit */}
        {qrData && !error && (
          <div className="p-4 bg-gray-100 rounded mt-4">
            <p className="break-all text-sm font-mono mb-2">
              Detected Session:
            </p>
            {/* <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                Subject ID: <span className="font-medium">{qrData.s}</span>
              </div>
              <div>
                Classroom ID: <span className="font-medium">{qrData.c}</span>
              </div>
              <div>
                Teacher ID: <span className="font-medium">{qrData.t}</span>
              </div>
              <div>
                Token:{' '}
                <span className="font-medium">
                  {qrData.tk.slice(0, 6)}...{qrData.tk.slice(-4)}
                </span>
              </div>
            </div> */}
            <button
              onClick={handleVerify}
              className={`mt-4 w-full bg-green-600 text-white px-4 py-2 rounded ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        )}

        {/* Error Display and Retry */}
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded mt-4">
            <p className="mb-2">Error: {error}</p>
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// Scan Qr section ends here

//Attendance Summary Section starts here.
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
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Attendance Summary
        </h2>

        {attendance ? (
          <div className="space-y-8">
            {/* Overall Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-4">
                  Total Classes
                </h3>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-3xl font-bold text-blue-600">
                      {attendance.overall.totalClasses}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Classroom: {attendance.overall.classroom.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-4">
                  Present Days
                </h3>
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <span className="text-3xl font-bold text-green-600">
                      {attendance.overall.presentCount}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {attendance.overall.totalClasses -
                        attendance.overall.presentCount}{" "}
                      absences
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-4">
                  Overall Percentage
                </h3>
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-purple-600"
                      strokeWidth="8"
                      strokeDasharray={`${
                        attendance.overall.percentage * 2.51
                      } 251`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-purple-700">
                    {attendance.overall.percentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Subject-wise Breakdown */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Subject-wise Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {attendance.bySubject.map((subject, index) => (
                  <div
                    key={subject.subject._id}
                    className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {subject.subject.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {subject.subject.code}
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          subject.percentage >= 75
                            ? "text-green-600"
                            : subject.percentage >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {subject.percentage}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Present: {subject.presentCount}</span>
                        <span>Total: {subject.totalClasses}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            subject.percentage >= 75
                              ? "bg-green-600"
                              : subject.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Attendance</span>
                        <span>
                          {Math.round(
                            (subject.presentCount / subject.totalClasses) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-4">
                  Best Performing Subject
                </h3>
                {[...attendance.bySubject].sort(
                  (a, b) => b.percentage - a.percentage
                )[0] && (
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <span className="text-2xl font-bold text-green-600">
                        🏆
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {
                          [...attendance.bySubject].sort(
                            (a, b) => b.percentage - a.percentage
                          )[0].subject.name
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {
                          [...attendance.bySubject].sort(
                            (a, b) => b.percentage - a.percentage
                          )[0].percentage
                        }
                        %
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-red-50 p-6 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-4">
                  Needs Improvement
                </h3>
                {[...attendance.bySubject].sort(
                  (a, b) => a.percentage - b.percentage
                )[0] && (
                  <div className="flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <span className="text-2xl font-bold text-red-600">
                        📉
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        {
                          [...attendance.bySubject].sort(
                            (a, b) => a.percentage - b.percentage
                          )[0].subject.name
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {
                          [...attendance.bySubject].sort(
                            (a, b) => a.percentage - b.percentage
                          )[0].percentage
                        }
                        %
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400">
              <svg
                className="w-20 h-20 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.4145.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No attendance records found</p>
          </div>
        )}
      </div>
    </div>
  );
};
// Attendance Summary Section ends here

// Student StudentDashboard section starts here
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("scan");

  useEffect(() => {
    if (user?.role !== "student") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
          <button onClick={logout} className="text-red-600 hover:text-red-800">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "scan"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("scan")}
          >
            Scan Attendance
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "summary"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("summary")}
          >
            My Attendance
          </button>
        </div>

        {activeTab === "scan" ? (
          <ScanAttendanceView />
        ) : (
          <AttendanceSummaryView />
        )}
      </main>
    </div>
  );
}
