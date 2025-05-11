import express from 'express';
import { check } from 'express-validator';
import { signup, login, logout } from '../controllers/authController.js';

const router = express.Router();

router.post( 
  '/signup', 
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
  ], 
  signup
);

router.post(
  '/login', 
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ], 
login);


router.post('/logout', logout);

export default router;