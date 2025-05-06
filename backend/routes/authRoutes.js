import express from 'express';
import { check } from 'express-validator';
import { signup, login, logout } from '../controllers/authController.js'; // Add logout

const router = express.Router();

router.post('/signup', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role is required').not().isEmpty(),
], signup);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
], login);

// Add logout route (protected, requires valid token)
router.post('/logout', logout); // No validation needed, just token check

export default router;