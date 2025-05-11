import Session from '../models/Session.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import qr from 'qr-image';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

// Teacher starts a new session
export const startSession = async (req, res, next) => {
  try {
    const { className, subjectId } = req.body;
    const teacherId = req.user.id;

    // Verify teacher is assigned to this class and subject
    const teacher = await User.findOne({
      _id: teacherId,
      className,
      subjects: subjectId,
      role: 'teacher'
    });

    if (!teacher) {
      return next(new ErrorResponse('Not authorized for this class/subject', 403));
    }

    // Generate session data
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Create QR Code
    const qrData = JSON.stringify({
      sessionId,
      className,
      subjectId,
      expiresAt: expiresAt.toISOString()
    });

    const qrImage = qr.imageSync(qrData, { type: 'png' });
    const qrBase64 = `data:image/png;base64,${qrImage.toString('base64')}`;

    // Create session record
    const session = await Session.create({
      sessionId,
      className,
      subject: subjectId,
      teacher: teacherId,
      expiresAt,
      isActive: true
    });

    res.status(201).json({
      success: true,
      qrCode: qrBase64,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt
    });

  } catch (err) {
    next(err);
  }
};

// Student validates and marks attendance
export const validateSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const studentId = req.user.id;

    // Find valid session
    const session = await Session.findOne({ sessionId });
    if (!session || !session.isActive) {
      return next(new ErrorResponse('Invalid session', 400));
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return next(new ErrorResponse('Session expired', 400));
    }

    // Verify student belongs to this class and subject
    const student = await User.findOne({
      _id: studentId,
      className: session.className,
      subjects: session.subject,
      role: 'student'
    });

    if (!student) {
      return next(new ErrorResponse('Not enrolled in this class/subject', 403));
    }

    // Check existing attendance
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      session: session._id
    });

    if (existingAttendance) {
      return next(new ErrorResponse('Attendance already marked', 400));
    }

    // Record attendance
    await Attendance.create({
      student: studentId,
      session: session._id
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully'
    });

  } catch (err) {
    next(err);
  }
};