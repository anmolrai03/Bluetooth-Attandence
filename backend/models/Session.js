import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  className: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

export default Session;