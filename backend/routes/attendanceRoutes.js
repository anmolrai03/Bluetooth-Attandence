import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { markAttendance, getAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.post(
  '/mark',
  protect,
  authorizeRoles('student'),
  markAttendance
);

router.get(
  '/:sessionId',
  protect,
  getAttendance
);

export default router;