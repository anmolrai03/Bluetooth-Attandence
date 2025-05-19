import Attendance from "../models/attendance.models.js";
import AttendanceSession from "../models/session.models.js";
import Subject from "../models/subject.models.js";
import Classroom from "../models/classroom.models.js";
import User from "../models/user.models.js";

//Teacher's endpoints starts here
// POST endpoint
const getAttendanceRecords = async (req, res) => {
  try {
    const { subjectId, classroomId, date } = req.body;
    const teacherId = req.user._id;

    // Validate required parameters
    if (!subjectId || !classroomId) {
      return res.status(400).json({
        success: false,
        message: "subjectId and classroomId are required in the request body",
      });
    }

    // Verifying the teacher has sessions for this subject and classroom
    const hasSessions = await AttendanceSession.exists({
      teacher: teacherId,
      subject: subjectId,
      classroom: classroomId,
    });

    if (!hasSessions) {
      return res.status(403).json({
        success: false,
        message:
          "You have no attendance sessions for this subject and classroom combination",
      });
    }

    // Building the query
    const query = {
      teacher: teacherId,
      subject: subjectId,
      classroom: classroomId,
    };

    // Add date filter if provided
    if (date) {
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Fetch attendance records with student and session details
    const records = await Attendance.find(query)
      .populate({
        path: "student",
        select: "fullName email role",
      })
      .populate({
        path: "subject",
        select: "name code",
      })
      .populate({
        path: "classroom",
        select: "name",
      })
      .populate({
        path: "session",
        select: "createdAt durationMinutes status",
      })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Format the response
    // In getAttendanceRecords controller
    const formattedRecords = records.map((record) => ({
      id: record._id,
      student: {
        id: record.student?._id || null,
        fullName: record.student?.fullName || "Unknown",
        email: record.student?.email || "N/A",
      },
      subject: record.subject || { _id: null, code: "N/A", name: "Unknown" },
      classroom: record.classroom || { _id: null, name: "Unknown" },
      status: record.status,
      session: record.session
        ? {
            date: record.session.createdAt,
            duration: record.session.durationMinutes,
            status: record.session.status,
          }
        : null, // Handle null session
      verification: {
        timestamp: record.verification?.timestamp || new Date(),
        method: record.verification?.qrCode ? "QR Code" : "Manual",
      },
    }));

    res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords,
    });
  } catch (err) {
    console.error("Error fetching attendance records:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
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
    if (!attendanceId || !status || !["present", "absent"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid attendanceId and status (present/absent) are required",
      });
    }

    // Verify the attendance record belongs to this teacher
    const attendance = await Attendance.findOne({
      _id: attendanceId,
      teacher: teacherId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message:
          "Attendance record not found or you are not authorized to modify it",
      });
    }

    // Update the status
    attendance.status = status;
    await attendance.save();

    res.json({
      success: true,
      message: "Attendance status updated successfully",
      data: {
        id: attendance._id,
        studentId: attendance.student,
        previousStatus: req.body.previousStatus,
        newStatus: attendance.status,
        updatedAt: attendance.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error updating attendance status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance status",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

//Teacher's endpoint section ends here.

//Student endpoint starts here.

// GET endpoint for student attendance summary starts here
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Verify the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this information",
      });
    }

    // Get all attendance records for the student
    const attendanceRecords = await Attendance.find({ student: studentId })
      .populate({
        path: "subject",
        select: "name code",
      })
      .populate({
        path: "classroom",
        select: "name",
      })
      .lean();

    // If no records found
    if (attendanceRecords.length === 0) {
      return res.json({
        success: true,
        message: "No attendance records found",
        data: {
          bySubject: [],
          overall: {
            totalClasses: 0,
            presentCount: 0,
            percentage: 0,
            classroom: null,
          },
        },
      });
    }

    // Group by subject
    const subjectMap = new Map();
    let totalPresent = 0;
    let totalClasses = 0;
    let classroom = null;

    attendanceRecords.forEach((record) => {
      // Set classroom (assuming student belongs to one classroom)
      if (!classroom) {
        classroom = record.classroom;
      }

      // Initialize subject entry if not exists
      if (!subjectMap.has(record.subject._id.toString())) {
        subjectMap.set(record.subject._id.toString(), {
          subject: record.subject,
          presentCount: 0,
          totalClasses: 0,
          percentage: 0,
        });
      }

      // Update counts
      const subjectEntry = subjectMap.get(record.subject._id.toString());
      subjectEntry.totalClasses++;
      totalClasses++;

      if (record.status === "present") {
        subjectEntry.presentCount++;
        totalPresent++;
      }

      // Calculate percentage
      subjectEntry.percentage = Math.round(
        (subjectEntry.presentCount / subjectEntry.totalClasses) * 100
      );
    });

    // Convert map to array
    const bySubject = Array.from(subjectMap.values());

    // Calculate overall percentage
    const overallPercentage = Math.round((totalPresent / totalClasses) * 100);

    res.json({
      success: true,
      data: {
        bySubject,
        overall: {
          totalClasses,
          presentCount: totalPresent,
          percentage: overallPercentage,
          classroom,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching student attendance:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
//Student attendance summary ends here.

// POST endpoint verify attendance starts here
const verifyAttendance = async (req, res) => {
  try {
    const { qrCode, rssi } = req.body;
    const studentId = req.user._id;

    // Validate request
    if (!qrCode || typeof rssi !== "number") {
      return res.status(400).json({
        success: false,
        message: "QR code and RSSI values are required",
      });
    }

    // Parse QR code data (assuming format from your session creation)
    let qrData;
    try {
      qrData = JSON.parse(qrCode);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code format",
      });
    }

    // Validate QR code structure
    if (!qrData.t || !qrData.s || !qrData.c || !qrData.tk) {
      return res.status(400).json({
        success: false,
        message: "QR code missing required fields",
      });
    }

    // Find active session matching QR code
    const session = await AttendanceSession.findOne({
      teacher: qrData.t,
      subject: qrData.s,
      classroom: qrData.c,
      qrCode: qrData.tk,
      status: "active",
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found or QR code expired",
      });
    }

    // Validate RSSI range (-35 to -75 is typical for close proximity)
    const isRssiValid = rssi >= -75 && rssi <= -35;

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      session: session._id,
      student: studentId,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already recorded for this session",
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      session: session._id,
      student: studentId,
      teacher: session.teacher,
      status: isRssiValid ? "present" : "absent",
      verification: {
        qrCode: qrData.tk,
        rssi,
        timestamp: new Date(),
      },
      subject: session.subject,
      classroom: session.classroom,
    });

    await attendance.save();

    res.json({
      success: true,
      message: `Attendance marked as ${isRssiValid ? "present" : "absent"}`,
      data: {
        status: attendance.status,
        subject: session.subject,
        classroom: session.classroom,
        timestamp: attendance.verification.timestamp,
        rssiValid: isRssiValid,
      },
    });
  } catch (err) {
    console.error("Attendance verification error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify attendance",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
//verify attendance ends here

//Student endpoint ends here

export {
  getAttendanceRecords,
  updateAttendanceStatus,
  getStudentAttendance,
  verifyAttendance,
};
