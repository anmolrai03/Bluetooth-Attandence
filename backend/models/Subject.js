import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  className: { 
    type: String, 
    required: true,
    trim: true 
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  code: {
    type: String,
    unique: true,
    trim: true
  }
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;