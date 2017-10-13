var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var UserModel = require('./userModel');
var UserController = require('./userController');
var mongoose = require('mongoose');
var googleJWT = require('./googleAuthJWT');

var app = express();
app.use(morgan('combined'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

const login = async (req, res, next) => {
  const { token } = req.body;
  let user = await UserModel.findOne({
    'activeJWT.id': token,
    'activeJWT.exp': { $lt: Date.now() / 1000 }
  });

  //jwt not active
  if (!user) {
    // TODO: figure out how to verify token (Google, FB, Twitter, ...)
    const payload = await googleJWT.verifyToken(token);
    // .catch(e => res.send(400).json({ error: e }));

    const transformedPayload = {
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

    // Try to update a user
    user = await UserModel.findOneAndUpdate(
      { googleId: payload.sub },
      { $set: { ...transformedPayload } }
    );

    // Create new user
    if (!user) {
      user = new UserModel({ ...transformedPayload, created: new Date() });
      user.save();
    }
  }
  req.user = user;
  next();
};

const authenticate = async (req, res, next) => {
  console.log(req.query.token);
  let user = await UserModel.findOne({
    'activeJWT.id': req.query.token,
    'activeJWT.exp': { $gt: Date.now() / 1000 }
  });
  console.log(user);
  if (!user) {
    res.status(401).json({ error: 'Not Authorized' });
  } else {
    req.user = user;
    next();
  }
};

mongoose.connect('mongodb://localhost/flystr');

app.post('/user/login', login, (req, res) => res.status(200).json(req.user));

app.get('/user/profile', authenticate, UserController.getOwnProfile);

app.listen(3000);
