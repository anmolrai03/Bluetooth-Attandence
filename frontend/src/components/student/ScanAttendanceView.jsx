import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AttendanceService } from "../../services";
import QrScanner from "qr-scanner";
import { BrowserQRCodeReader } from "@zxing/browser";
import useBLE from "../../hooks/useBLE";
import { FaCamera, FaUpload, FaMobileAlt, FaWifi } from "react-icons/fa";

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
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  // Initialize ZXing QR Reader
  useEffect(() => {
    if (inputMethod === "camera" && videoRef.current) {
      codeReader.current = new BrowserQRCodeReader();
      codeReader.current
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            handleQrScan({ text: result.getText() });
          }
          if (error && !error.isNoStreamError()) {
            console.error("QR Scan Error:", error);
          }
        })
        .catch((err) => {
          console.log(err)
          setError("Failed to access camera");
          toast.error("Failed to access camera");
        });
    }

    return () => {
      if (codeReader.current) {
        try {
          codeReader.current.stopContinuousDecode(); // Correct method to stop decoding
        } catch (err) {
          console.error("Error stopping QR reader:", err);
        }
      }
    };
  }, [inputMethod]);

  const generateDemoRssi = () => {
    const rssi = Math.floor(Math.random() * (-35 - -75 + 1) + -75);
    setGeneratedRssi(rssi);
    return rssi;
  };

  const validateDroidCamUrl = (url) => {
    const urlPattern =
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}\/video$/;
    return urlPattern.test(url);
  };

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
    // Note: DroidCam requires additional setup for video streaming
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      const result = await QrScanner.scanImage(file);
      const parsedData = JSON.parse(result);

      if (!parsedData.t || !parsedData.s || !parsedData.c || !parsedData.tk) {
        throw new Error("Invalid QR code format");
      }

      setQrData(parsedData);
      toast.success("QR code scanned successfully");
    } catch (error) {
      setError(error.message || "Failed to read QR code");
      toast.error(error.message || "Failed to read QR code");
      setFilePreview(null);
      setQrData(null);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleVerify = useCallback(async () => {
    if (!qrData) {
      toast.error("No QR data detected! Please scan a valid QR code", {
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rssi = demoMode ? generatedRssi : -55;
      const response = await AttendanceService.verify(qrData, rssi);

      if (response.success) {
        const successMessage =
          response.message || "Attendance recorded successfully!";
        const data = response.data || {};
        toast.success(successMessage, { autoClose: 2000 });
        if(data.status == 'present'){
            toast.info(
            `Status: ${data.status || "present"}\n` +
              `Time: ${
                data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A"
              }`,
            { autoClose: 3000, style: { whiteSpace: "pre-line" } }
          );
        } else{
          toast.warn(
          `Status: ${data.status || "present"}\n` +
            `Time: ${
              data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A"
            }`,
          { autoClose: 3000, style: { whiteSpace: "pre-line" } }
        );
        }
        
        // setTimeout(() => navigate("/attendance"), 2000);
      } else {
        const errorMessage =
          response.data.message || "Attendance verification failed";
        console.log("inside eles" , response.data.message);
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } catch (error) {
      const statusCode = error.response?.status;
      const backendMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to verify attendance";

        console.log("inside cathc" , error);

        // console.log("catch block" , error);

      if (statusCode === 400) {
        toast.error(`Invalid Input: ${backendMessage}`, { autoClose: 5000 });
      } else if (statusCode === 404) {
        toast.error(`Session Error: ${backendMessage}`, { autoClose: 5000 });
      } else if (statusCode === 409) {
        toast.warn(`Already Recorded: ${backendMessage}`, { autoClose: 5000 });
      } else {
        toast.error(`Error ${statusCode || ""}: ${backendMessage}`, {
          autoClose: 5000,
        });
      }

      setQrData(null);
      setFilePreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [qrData, demoMode, generatedRssi, navigate]);

  const handleRetry = () => {
    setQrData(null);
    setFilePreview(null);
    setError(null);
    setCustomCameraUrl("");
    setInputMethod("camera");
  };

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaCamera className="mr-2 text-blue-600" /> Mark Attendance
      </h2>

      {/* Input Method Selection */}
      <div className="mb-6 flex gap-3 flex-wrap">
        {!isMobile && (
          <button
            onClick={() => setInputMethod("camera")}
            className={`flex items-center px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${
              inputMethod === "camera"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-blue-100"
            }`}
            disabled={isLoading}
          >
            <FaCamera className="mr-2" /> Camera
          </button>
        )}
        <button
          onClick={() => setInputMethod("upload")}
          className={`flex items-center px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${
            inputMethod === "upload"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          disabled={isLoading}
        >
          <FaUpload className="mr-2" /> Upload QR
        </button>
        <button
          onClick={() => setInputMethod("droidcam")}
          className={`flex items-center px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${
            inputMethod === "droidcam" // Changed from progrinputMethod to inputMethod
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-blue-100"
          }`}
          disabled={isLoading}
        >
          <FaMobileAlt className="mr-2" /> DroidCam
        </button>
      </div>

      {/* DroidCam URL Input */}
      {inputMethod === "droidcam" && (
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Enter DroidCam URL (e.g., http://192.168.1.2:4747/video)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={customCameraUrl}
            onChange={(e) => setCustomCameraUrl(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={handleDroidCamConnect}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
            disabled={isLoading}
          >
            Connect
          </button>
        </div>
      )}

      {/* Demo Mode Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={demoMode}
            onChange={(e) => setDemoMode(e.target.checked)}
            disabled={isLoading}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="font-medium">Demo Mode (Random RSSI)</span>
        </label>
      </div>

      {/* Signal Strength */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-gray-700 font-medium flex items-center">
          <FaWifi className="mr-2 text-blue-600" /> Signal Strength:
        </span>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
            (demoMode ? generatedRssi : currentRssi) >= -55
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {demoMode ? generatedRssi : currentRssi || "--"} dBm
        </span>
        {demoMode && (
          <button
            onClick={generateDemoRssi}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            disabled={isLoading}
          >
            Regenerate RSSI
          </button>
        )}
      </div>

      {/* Camera Input */}
      {inputMethod === "camera" && (
        <div className="relative w-full h-72 bg-black rounded-xl overflow-hidden shadow-md">
          <video ref={videoRef} className="w-full h-full" />
          <div className="absolute inset-0 border-4 border-blue-500 rounded-xl pointer-events-none animate-pulse" />
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
            className={`block w-full py-3 px-6 bg-blue-600 text-white rounded-lg text-center cursor-pointer shadow-md transition-all duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.3"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Upload QR Image"
            )}
          </label>

          {filePreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2 font-medium">Preview:</p>
              <img
                src={filePreview}
                alt="QR Preview"
                className="max-w-xs mx-auto border-2 border-blue-200 rounded-lg p-2 shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* QR Data Display and Submit */}
      {qrData && !error && (
        <div className="p-5 bg-white rounded-lg mt-6 shadow-md border border-blue-100">
          <p className="text-sm text-gray-600 mb-3 font-medium">
            Detected Session:
          </p>
          <button
            onClick={handleVerify}
            className={`mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.3"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Attendance"
            )}
          </button>
        </div>
      )}

      {/* Error Display and Retry */}
      {error && (
        <div className="p-5 bg-red-50 text-red-800 rounded-lg mt-6 shadow-md border border-red-200">
          <p className="mb-3 font-medium">Error: {error}</p>
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanAttendanceView;
