import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  qrCode: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 3 },
  expiresAt: { 
    type: Date, 
    default: function() { 
      return new Date(this.createdAt.getTime() + this.durationMinutes * 60000); 
    } 
  },
  status: {
    type: String,
    enum: ['active', 'terminated', 'expired'],
    default: 'active'
  }
}, { timestamps: true });

// Auto-update status when saving
sessionSchema.pre('save', function(next) {
  if (this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

const AttendanceSession = mongoose.model('AttendanceSession', sessionSchema);
export default AttendanceSession;