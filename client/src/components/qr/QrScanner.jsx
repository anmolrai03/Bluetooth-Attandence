import { useCallback, useRef } from 'react';
import QrScanner from 'react-qr-scanner';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function QrScannerComponent({ onScan, onClose }) {
  const scannerRef = useRef(null);

  const handleScan = useCallback((data) => {
    if (data) {
      onScan(data.text);
    }
  }, [onScan]);

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <QrScanner
        ref={scannerRef}
        delay={300}
        onError={handleError}
        onScan={handleScan}
        constraints={{ facingMode: 'environment' }}
        className="rounded-lg overflow-hidden"
      />
      <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none" 
           style={{ margin: '1rem' }} />
      
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        aria-label="Close scanner"
      >
        <XCircleIcon className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
}