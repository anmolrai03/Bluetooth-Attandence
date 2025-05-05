import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  session: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session',
    required: true 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    default: 'present' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;