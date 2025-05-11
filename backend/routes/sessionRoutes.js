import express from 'express';
import { check } from 'express-validator';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { startSession, validateSession } from '../controllers/sessionController.js';

const router = express.Router();

// Teacher starts session
router.post(
  '/start',
  [
    check('className', 'Class name is required').not().isEmpty(),
    check('subjectId', 'Subject ID is required').isMongoId()
  ],
  protect,
  authorizeRoles('teacher'),
  startSession
);

// Student validates session
router.post(
  '/validate',
  [
    check('sessionId', 'Session ID is required').not().isEmpty()
  ],
  protect,
  authorizeRoles('student'),
  validateSession
);

export default router;