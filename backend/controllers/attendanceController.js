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


// Get student's attendance summary
export const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    
    const summary = await Attendance.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'sessions',
          localField: 'session',
          foreignField: '_id',
          as: 'sessionData'
        }
      },
      { $unwind: '$sessionData' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'sessionData.subject',
          foreignField: '_id',
          as: 'subjectData'
        }
      },
      { $unwind: '$subjectData' },
      {
        $group: {
          _id: '$subjectData._id',
          subjectName: { $first: '$subjectData.name' },
          className: { $first: '$subjectData.className' },
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          subjectName: 1,
          className: 1,
          totalClasses: 1,
          presentClasses: 1,
          attendancePercentage: {
            $multiply: [
              { $divide: ['$presentClasses', '$totalClasses'] },
              100
            ]
          }
        }
      }
    ]);

    // Calculate overall percentage
    const overall = {
      totalClasses: summary.reduce((acc, curr) => acc + curr.totalClasses, 0),
      presentClasses: summary.reduce((acc, curr) => acc + curr.presentClasses, 0),
    };
    overall.attendancePercentage = overall.totalClasses > 0 
      ? (overall.presentClasses / overall.totalClasses) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        bySubject: summary,
        overall
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance for teacher's view
export const getClassAttendance = async (req, res, next) => {
  try {
    const { className, date } = req.query;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const sessions = await Session.find({
      className,
      createdAt: { $gte: startDate, $lt: endDate }
    });

    const attendanceRecords = await Attendance.find({
      session: { $in: sessions.map(s => s._id) }
    })
      .populate('student', 'name email')
      .populate('session', 'sessionId createdAt');

    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (err) {
    next(err);
  }
};

// Update attendance status
export const updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      { status },
      { new: true }
    ).populate('student', 'name');

    if (!attendance) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (err) {
    next(err);
  }
};