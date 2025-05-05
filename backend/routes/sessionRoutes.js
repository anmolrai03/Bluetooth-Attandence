import express from 'express';
import { check } from 'express-validator';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { startSession, getSessions, getSessionById } from '../controllers/sessionController.js';

const router = express.Router();

router.post(
  '/start',
  [
    check('className', 'Class name is required').not().isEmpty(),
    check('subjectId', 'Subject ID is required').not().isEmpty()
  ],
  protect,
  authorizeRoles('teacher'),
  startSession
);

router.get(
  '/',
  protect,
  authorizeRoles('teacher'),
  getSessions
);

router.get(
  '/:id',
  protect,
  getSessionById
);

export default router;