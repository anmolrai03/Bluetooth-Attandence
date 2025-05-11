import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code: String,
  name: String,
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
