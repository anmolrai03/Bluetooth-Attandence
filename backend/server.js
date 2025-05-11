import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';


import subjectRoutes from './routes/subjectRoute.js';



dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Database connection
// connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use('/api/subjects', subjectRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then( () =>{
    app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
  })
  .catch( err => console.log("MongoDB connection error: ", err))

