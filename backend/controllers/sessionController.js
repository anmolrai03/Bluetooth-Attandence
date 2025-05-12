import AttendanceSession from '../models/session.models.js';
import QRCode from 'qrcode';
import crypto from 'crypto';

const createSession = async (req, res) => {
  try {
    const { subject, classroom } = req.body;
    const teacher = req.user._id;

    if (!subject || !classroom) {
      return res.status(400).json({ 
        success: false,
        message: 'Subject and classroom are required' 
      });
    }

    // 1. Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // 2. Create optimized QR payload
    const qrPayload = JSON.stringify({
      t: teacher.toString(),
      s: subject.toString(),
      c: classroom.toString(),
      tk: sessionToken
    });

    // 3. Generate QR code with optimized settings
    const qrCode = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'L',
      margin: 1,
      scale: 4
    });

    // 4. Create session with explicit status and auto-expiry
    const session = new AttendanceSession({
      teacher,
      subject,
      classroom,
      qrCode: sessionToken,
      durationMinutes: req.body.duration || 3,
      status: 'active' // Explicitly set status
    });

    await session.save();

    // 5. Response optimized for frontend
    res.status(201).json({
      success: true,
      message: "Session started successfully",
      sessionId: session._id,
      qrCodeImage: qrCode,
      expiresAt: session.expiresAt,
      durationMinutes: session.durationMinutes,
      status: session.status
    });

  } catch (err) {
    console.error('Session creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Session creation failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const currentTime = new Date();
    
    // Find active sessions that haven't expired yet
    const sessions = await AttendanceSession.find({
      teacher: req.user._id,
      status: 'active',
      expiresAt: { $gt: currentTime }
    })
    .populate({
      path: 'subject',
      select: 'name code _id'
    })
    .populate({
      path: 'classroom',
      select: 'name _id'
    })
    .lean(); // Using lean() for better performance

    // Calculate remaining time for each session
    const enrichedSessions = sessions.map(session => ({
      ...session,
      expiresInMinutes: Math.max(0, Math.round((session.expiresAt - currentTime) / 60000))
    }));

    res.json({
      success: true,
      count: enrichedSessions.length,
      data: enrichedSessions
    });
  } catch (err) {
    console.error('Failed to fetch active sessions:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active sessions',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const terminateSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({
      _id: req.params.id,
      teacher: req.user._id,
      status: 'active' // Only allow terminating active sessions
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Active session not found or already terminated/expired' 
      });
    }

    // Update session to terminated status
    session.status = 'terminated';
    session.expiresAt = new Date(); // Set expiration to now
    await session.save();

    res.json({ 
      success: true, 
      message: 'Session terminated successfully',
      terminatedAt: new Date()
    });
  } catch (err) {
    console.error('Session termination error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to terminate session',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Optional: Background task to mark expired sessions
const updateExpiredSessions = async () => {
  try {
    const result = await AttendanceSession.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    );
    console.log(`Marked ${result.modifiedCount} sessions as expired`);
  } catch (err) {
    console.error('Error updating expired sessions:', err);
  }
};

// Run the expiration check periodically (e.g., every 5 minutes)
setInterval(updateExpiredSessions, 5 * 60 * 1000);

export { createSession, getActiveSessions, terminateSession };