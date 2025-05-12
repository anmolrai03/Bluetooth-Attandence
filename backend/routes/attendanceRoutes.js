import express from 'express';
import { getAttendanceRecords, updateAttendanceStatus, getStudentAttendance } from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

//teacher routes.
router.post('/records', protect, authorizeRoles('teacher'), getAttendanceRecords);
router.patch('/update/:attendanceId', protect, authorizeRoles('teacher'), updateAttendanceStatus);

//student routes
router.get('/get-attendance', protect, authorizeRoles('student'), getStudentAttendance);

export default router;