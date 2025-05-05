import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentIcon, 
  CheckIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import QrGenerator from '../../components/qr/QrGenerator';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await sessionService.getSessions();
        setSessions(response.data);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };
    
    loadSessions();
  }, []);

  const startNewSession = async () => {
    try {
      const response = await sessionService.startSession({
        className: "CS-A", // Dynamic in real app
        subjectId: "math-101" // Dynamic in real app
      });
      
      const newSession = response.data.session;
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setShowQRModal(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard content with QR modal */}
      <AnimatePresence>
        {showQRModal && currentSession && (
          <QRModal 
            session={currentSession} 
            onClose={() => setShowQRModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const QRModal = ({ session, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <QrGenerator sessionId={session.sessionId} />
    </motion.div>
  </motion.div>
);