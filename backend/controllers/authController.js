import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.models.js';
import Token from '../models/token.models.js';

import { ErrorResponse } from '../middleware/errorMiddleware.js';

//SignUp Section starts here
const signup = async (req, res, next) => {

  const { name, email, password, role} = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User already exists', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '1d',
    });

    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      token,
      user: { id: user._id, name: user.fullName, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};
//sign up section ends here.

//Loign section starts here
const login = async (req, res, next) => {
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
      user: { id: user._id, name: user.fullName, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};
// login section ends here

//logout section starts here
const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new ErrorResponse('No token provided', 400));
    }

    // Verify the token to get its expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token to blacklist
    await Token.create({
      token,
      expiresAt: new Date(decoded.exp * 1000) // Convert JWT exp to Date
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    next(err);
  }
};
// logout section ends here

export {signup , login , logout};