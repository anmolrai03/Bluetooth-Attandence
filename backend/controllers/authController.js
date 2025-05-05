import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

export const signup = async (req, res, next) => {
  const { name, email, password, role, className } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      className: role === 'student' ? className : undefined,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1d',
    });

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('No user exists', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1d',
    });

    res.status(200).json({
      success: true,
      message: "login success",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};