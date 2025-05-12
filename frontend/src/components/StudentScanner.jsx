import { useState } from 'react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import { useAuth } from '../context/authContext';

export default function StudentScanner() {
  const { user } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (data) => {
    if (data && !loading) {
      setLoading(true);
      try {
        const res = await axios.post('/api/sessions/validate', 
          { sessionId: data },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setResult(res.data.message);
      } catch (err) {
        setResult(err.response?.data?.message || 'Error validating session');
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Scan Attendance QR Code</h2>
      
      <div className="qr-scanner-wrapper mb-4">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result) => {
            if (result) handleScan(result?.text);
          }}
          className="qr-video"
        />
      </div>

      {loading && <p className="text-info">Processing...</p>}
      {result && (
        <p className={`text-${result.includes('success') ? 'success' : 'error'}`}>
          {result}
        </p>
      )}
    </div>
  );
}