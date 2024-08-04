const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
  }

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;