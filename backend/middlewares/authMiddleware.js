const jwt = require('jsonwebtoken');

// roles = [] allows optional role-based access control
const verifyToken = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers?.authorization;

    // Check if token is present and valid format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract token

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

      // Optional: Check user role
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      // Attach user info to request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next(); // Proceed to next middleware/route
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }
  };
};

module.exports = verifyToken;
