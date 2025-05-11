import express from 'express';
import {
  createSession,
  getActiveSessions,
  terminateSession
} from '../controllers/sessionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/start',
  protect,
  authorizeRoles('teacher'),
  createSession
);

//still needs to be worked on.
router.get(
  '/active',
  protect,
  authorizeRoles('teacher'),
  getActiveSessions
);

router.patch(
  '/terminate/:id', //sessionId
  protect,
  authorizeRoles('teacher'),
  terminateSession
);

export default router;
