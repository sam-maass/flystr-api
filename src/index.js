var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');

var UserController = require('./controller/userController');
var TripController = require('./controller/tripController');
var DealController = require('./controller/dealController');
var { authenticate, validateToken } = require('./authMiddleware');

var PORT = process.env.PORT;
var MONGO_URL = process.env.MONGO_URL;

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
  .connect(MONGO_URL, { useMongoClient: true })
  .catch(e => console.error(e));

app.post('/user/signup', validateToken, UserController.signup);
app.post('/user/login', validateToken, UserController.login);
app.post('/user/logout', authenticate, UserController.logout);
app.get('/user/profile', authenticate, UserController.getOwnProfile);
app.post('/trip', authenticate, TripController.insert);
app.get('/trip', authenticate, TripController.getUserTrips);
app.post('/deal', authenticate, DealController.insert);
app.get('/deal', authenticate, DealController.get);

app.listen(PORT);
console.log(`API running on port ${PORT}`);
