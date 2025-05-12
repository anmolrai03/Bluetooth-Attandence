import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';

export default function TeacherStartSession() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ className: '', subjectId: '' });
  const [qrCode, setQrCode] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/sessions/start', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setQrCode(res.data.qrCode);
      setExpiry(new Date(res.data.expiresAt).toLocaleTimeString());
      
      // Auto-redirect after 3 minutes
      setTimeout(() => {
        window.location.href = '/attendance';
      }, 180000);

    } catch (err) {
      alert(err.response?.data?.message || 'Error starting session');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {qrCode ? (
        <div>
          <img src={qrCode} alt="Attendance QR Code" className="mb-4" />
          <p>Expires at: {expiry}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Class Name"
            value={formData.className}
            onChange={(e) => setFormData({...formData, className: e.target.value})}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="text"
            placeholder="Subject ID"
            value={formData.subjectId}
            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
            className="input input-bordered w-full mb-2"
          />
          <button type="submit" className="btn btn-primary w-full">
            Start Attendance
          </button>
        </form>
      )}
    </div>
  );
}