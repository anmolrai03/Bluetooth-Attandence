import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  qrCode: { type: String, required: true },

  
  createdAt: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 3 }, // Explicit duration
  expiresAt: { 
    type: Date, 
    default: function() { 
      return new Date(this.createdAt.getTime() + this.durationMinutes * 60000); 
    } 
  }
}, { timestamps: true });

const AttendanceSession = mongoose.model('AttendanceSession', sessionSchema);
export default AttendanceSession;