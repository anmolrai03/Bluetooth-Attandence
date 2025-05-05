import Session from '../models/Session.js';
import { generateQRCode } from '../utils/generateQR.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

export const startSession = async (req, res, next) => {
  const { className, subjectId } = req.body;

  try {
    const sessionId = `sess-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 
      (process.env.SESSION_TIMEOUT_MINUTES || 5) * 60 * 1000);

    const session = await Session.create({
      className,
      subject: subjectId,
      sessionId,
      expiresAt,
      teacher: req.user._id
    });

    const qrData = {
      sessionId: session.sessionId,
      className: session.className,
      expiresAt: session.expiresAt.toISOString()
    };

    const qrCodeUrl = await generateQRCode(qrData);

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        sessionId: session.sessionId,
        className: session.className,
        expiresAt: session.expiresAt,
        isActive: session.isActive
      },
      qrCodeUrl
    });
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ teacher: req.user._id })
      .populate('subject', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('subject', 'name')
      .populate('teacher', 'name');

    if (!session) {
      return next(new ErrorResponse('Session not found', 404));
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
};