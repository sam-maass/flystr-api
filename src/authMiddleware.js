import googleJWT from './googleAuthJWT';
import jwt from 'jsonwebtoken';

const authenticateAdmin = async (req, res, next) => {
  const token = req.get('authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  } else {
    const { user } = await decodeToken(token, res);

    if (user.isAdmin) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ error: 'Not allowed' });
    }
  }
};

const authenticate = async (req, res, next) => {
  const token = req.get('authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  } else {
    const { user } = await decodeToken(token, res);
    if (user) {
      req.user = user;
      next();
    }
  }
};

const validateToken = async (req, res, next) => {
  const token = req.get('authorization');

  // TODO: figure out how to verify token (Google, FB, Twitter, ...)
  const payload = await googleJWT.verifyToken(token);

  if (!payload) {
    res.status(500).json({ error: "Can't verify auth token" });
  } else {
    req.user = {
      googleId: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      lastLogin: new Date()
    };
    next();
  }
};

module.exports = { authenticate, authenticateAdmin, validateToken };

async function decodeToken(token, res) {
  let decodedToken = {};
  try {
    decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    res.status(401).json({ error: e });
  }
  return decodedToken;
}
