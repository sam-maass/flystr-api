const googleJWT = require('./googleAuthJWT');
const UserModel = require('./model/userModel');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  const token = req.get('authorization');
  const doc = await jwt.decode(token);
  console.log(doc.exp, Date.now() / 1000);

  if (doc.exp < Date.now() / 1000) {
    res.status(401).json({ error: 'JWT expired' });
  }
  const user = await UserModel.findOne({
    activeJWT: token
  });
  if (!user) {
    res.status(401).json({ error: 'JWT unknown' });
  } else {
    req.user = user;
    next();
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
      activeJWT: token,
      googleId: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      lastLogin: new Date()
    };
    next();
  }
};

module.exports = { authenticate, validateToken };
