import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  markAttendance,
  getAttendance,
  getStudentAttendanceSummary,
  getClassAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/mark", protect, authorizeRoles("student"), markAttendance);

router.get("/:sessionId", protect, getAttendance);

router.get('/student/summary', protect, authorizeRoles('student'), getStudentAttendanceSummary);
router.get('/class', protect, authorizeRoles('teacher'), getClassAttendance);
router.put('/:attendanceId', protect, authorizeRoles('teacher'), updateAttendance);

export default router;
