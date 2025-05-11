import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import Token from '../models/token.models.js'; // Add this

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token?.startsWith('Bearer ')) {
    try {
      token = token.split(' ')[1];
      
      // Check if token is blacklisted
      const blacklistedToken = await Token.findOne({ token });
      if (blacklistedToken) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has been invalidated (logged out)' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role (${req.user.role}) not authorized` 
      });
    }
    next();
  };
};

export {protect , authorizeRoles};