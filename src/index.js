var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var UserModel = require('./userModel');
var UserController = require('./userController');
var TripController = require('./tripController');
var mongoose = require('mongoose');
var { authenticate, validateToken } = require('./authMiddleware');

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
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

mongoose.Promise = global.Promise;
mongoose
  .connect('mongodb://localhost/flystr', { useMongoClient: true })
  .catch(e => console.error(e));

app.post('/user/signup', validateToken, UserController.signup);
app.post('/user/login', validateToken, UserController.login);
app.post('/user/logout', authenticate, UserController.logout);
app.get('/user/profile', authenticate, UserController.getOwnProfile);
app.post('/trip', authenticate, TripController.insert);
app.get('/trip', authenticate, TripController.getUserTrips);

app.listen(3000);
console.log('API running on port 3000');
