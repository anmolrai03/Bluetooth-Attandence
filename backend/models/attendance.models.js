import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({

  //session data
  session: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true 
  },

  //student and teacher link
  student: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
  },
  
  //status
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    default: 'absent' 
  },


  //verification data
  verification: {
    qrCode: { 
      type: String, required: true 
    }, // Scanned QR value
    rssi: {
      type: Number 
      }, // Simulated value from frontend
    timestamp: { 
      type: Date, default: Date.now 
    }
  },

  //subject/classroom references
  subject: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true 
  },
  classroom: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true 
  }
}, { timestamps: true });

attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;