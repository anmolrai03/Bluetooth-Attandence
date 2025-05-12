import Attendance from '../models/attendance.models.js';
import AttendanceSession from '../models/session.models.js';
import Subject from '../models/subject.models.js';
import Classroom from '../models/classroom.models.js';

// POST endpoint to get attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    const { subjectId, classroomId, date } = req.body;
    const teacherId = req.user._id;

    // Validate required parameters
    if (!subjectId || !classroomId) {
      return res.status(400).json({
        success: false,
        message: 'subjectId and classroomId are required in the request body'
      });
    }

    // Verify the teacher has sessions for this subject and classroom
    const hasSessions = await AttendanceSession.exists({
      teacher: teacherId,
      subject: subjectId,
      classroom: classroomId
    });

    if (!hasSessions) {
      return res.status(403).json({
        success: false,
        message: 'You have no attendance sessions for this subject and classroom combination'
      });
    }

    // Build the query
    const query = { 
      teacher: teacherId,
      subject: subjectId,
      classroom: classroomId
    };

    // Add date filter if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Fetch attendance records with student and session details
    const records = await Attendance.find(query)
      .populate({
        path: 'student',
        select: 'fullName email role'
      })
      .populate({
        path: 'subject',
        select: 'name code'
      })
      .populate({
        path: 'classroom',
        select: 'name'
      })
      .populate({
        path: 'session',
        select: 'createdAt durationMinutes status'
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Format the response
    const formattedRecords = records.map(record => ({
      id: record._id,
      student: {
        id: record.student._id,
        fullName: record.student.fullName,
        email: record.student.email
      },
      subject: record.subject,
      classroom: record.classroom,
      status: record.status,
      session: {
        date: record.session.createdAt,
        duration: record.session.durationMinutes,
        status: record.session.status
      },
      verification: {
        timestamp: record.verification.timestamp,
        method: record.verification.qrCode ? 'QR Code' : 'Manual'
      }
    }));

    res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });

  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// PATCH endpoint to update attendance status
const updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;
    const teacherId = req.user._id;

    // Validate input
    if (!attendanceId || !status || !['present', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid attendanceId and status (present/absent) are required'
      });
    }

    // Verify the attendance record belongs to this teacher
    const attendance = await Attendance.findOne({
      _id: attendanceId,
      teacher: teacherId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found or you are not authorized to modify it'
      });
    }

    // Update the status
    attendance.status = status;
    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance status updated successfully',
      data: {
        id: attendance._id,
        studentId: attendance.student,
        previousStatus: req.body.previousStatus,
        newStatus: attendance.status,
        updatedAt: attendance.updatedAt
      }
    });

  } catch (err) {
    console.error('Error updating attendance status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export { getAttendanceRecords, updateAttendanceStatus };