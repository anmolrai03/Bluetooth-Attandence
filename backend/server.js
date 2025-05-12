import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//db import
import connectDB from './config/db.js';

//middleware imports
import { errorHandler } from './middleware/errorMiddleware.js';

//routes import
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
// import subjectRoutes from './routes/subjectRoute.js';


dotenv.config();

const app = express();

// Middleware starts here
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());
//middleware ends here

// Routes starts here
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// app.use('/api/subjects', subjectRoutes);

//Routes ends here.

// Error handling middleware
app.use(errorHandler);

//connection code
const PORT = process.env.PORT || 5000;

//db connection and server start
connectDB()
  .then( () =>{
    app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
  })
  .catch( err => console.log("MongoDB connection error: ", err))

