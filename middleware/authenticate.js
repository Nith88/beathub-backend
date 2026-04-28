const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. No token → reject
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch FULL user (IMPORTANT: ensure role is included)
    const currentUser = await User.findById(decoded.id).select('+password role');

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 🔥 DEBUG (remove later)
    console.log("AUTH USER:", {
      id: currentUser._id,
      email: currentUser.email,
      role: currentUser.role
    });

    // 5. Attach user
    req.user = currentUser;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = authenticate;