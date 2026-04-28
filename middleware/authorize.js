// Higher-order function that returns the actual middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    
    // 1. Check if authentication middleware ran successfully
    // (req.user is set by authenticate.js)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to access this resource.'
      });
    }

    // 2. Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    // 3. User has the required role, let them pass
    next();
  };
};

module.exports = authorize;