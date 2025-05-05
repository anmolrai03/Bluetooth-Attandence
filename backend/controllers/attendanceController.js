import Attendance from '../models/Attendance.js';
import Session from '../models/Session.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

export const markAttendance = async (req, res, next) => {
  const { sessionId } = req.body;

  try {
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return next(new ErrorResponse('Invalid session ID', 404));
    }

    if (!session.isActive || new Date(session.expiresAt) < new Date()) {
      return next(new ErrorResponse('Session has expired', 400));
    }

    let attendance = await Attendance.findOne({
      student: req.user._id,
      session: session._id
    });

    if (!attendance) {
      attendance = new Attendance({
        student: req.user._id,
        session: session._id,
        status: 'present'
      });
    } else {
      attendance.status = 'present';
      attendance.updatedAt = new Date();
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const attendanceList = await Attendance.find({ session: req.params.sessionId })
      .populate('student', 'name email className')
      .populate('session', 'sessionId className');

    res.status(200).json({
      success: true,
      count: attendanceList.length,
      data: attendanceList
    });
  } catch (err) {
    next(err);
  }
};