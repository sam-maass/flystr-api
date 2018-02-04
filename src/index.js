const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const UserController = require('./controller/userController');
const TripController = require('./controller/tripController');
const DealController = require('./controller/dealController');
const AirportController = require('./controller/airportController');
const { authenticate, validateToken } = require('./authMiddleware');

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();
app.use(morgan('combined'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL).catch(e => console.error(e));

app.post('/user/signup', validateToken, UserController.signup);
app.post('/user/login', validateToken, UserController.login);
app.post('/user/logout', authenticate, UserController.logout);
app.get('/user/profile', authenticate, UserController.getOwnProfile);

app.post('/trips/:tripId', authenticate, TripController.update);
app.post('/trips', authenticate, TripController.insert);
app.get('/trips', authenticate, TripController.getUserTripsWithDeals);

app.post('/deal', authenticate, DealController.insert);

app.get('/airports', authenticate, AirportController.getSuggestions);
app.listen(PORT);
console.log(`API running on port ${PORT}`);
