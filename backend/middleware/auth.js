const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

const baseAccess = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role === 'BASE_COMMANDER' && req.user.baseId) {
    req.baseFilter = { baseId: req.user.baseId };
    return next();
  }

  if (req.user.role === 'LOGISTICS_OFFICER') {
    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
};

module.exports = { authenticate, authorize, baseAccess };
