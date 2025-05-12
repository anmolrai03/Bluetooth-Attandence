import express from 'express';
import { getAttendanceRecords, updateAttendanceStatus } from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/records', protect, authorizeRoles('teacher'), getAttendanceRecords);
router.patch('/update/:attendanceId', protect, authorizeRoles('teacher'), updateAttendanceStatus);

export default router;