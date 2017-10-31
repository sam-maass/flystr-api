var googleJWT = require('./googleAuthJWT');
var UserModel = require('./userModel');

const authenticate = async (req, res, next) => {
  var authToken = req.get('authorization');
  let user = await UserModel.findOne({
    'activeJWT.id': authToken,
    'activeJWT.exp': { $gt: Date.now() / 1000 }
  });
  if (!user) {
    res.status(401).json({ error: 'Not Authorized' });
  } else {
    req.user = user;
    next();
  }
};

const validateToken = async (req, res, next) => {
  var token = req.get('authorization');

  // TODO: figure out how to verify token (Google, FB, Twitter, ...)
  const payload = await googleJWT.verifyToken(token);

  if (!payload) {
    res.status(500).json({ error: "Can't verify auth token" });
  } else {
    req.user = {
      activeJWT: {
        id: token,
        exp: payload.exp
      },
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
