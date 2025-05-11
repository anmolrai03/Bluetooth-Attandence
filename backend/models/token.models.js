import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({

  token: { 
    type: String, 
    required: true, 
    unique: true 
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
  
});

const Token = mongoose.model('Token', tokenSchema);
export default Token;
