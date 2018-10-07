const express = require('express'),
  router = express.Router();

import UserController from './controller/userController';
import TripController from './controller/tripController';
import DealController from './controller/dealController';
import FlightController from './controller/flightController';
import AirportController from './controller/airportController';
const {
  authenticate,
  validateToken,
  authenticateAdmin
} = require('./authMiddleware');

router.post('/user/signup', validateToken, UserController.signup);
router.post('/user/signup-email', UserController.signupWithEmail);
router.post('/user/login', validateToken, UserController.login);
router.post('/user/login-email', UserController.loginWithEmail);
router.post('/user/logout', authenticate, UserController.logout);
router.get('/user/refreshToken', authenticate, UserController.refreshToken);
router.get('/user/profile', authenticate, UserController.getProfile);

router.post('/trips/:tripId', authenticate, TripController.update);
router.delete('/trips/:tripId', authenticate, TripController.delete);
router.post('/trips', authenticate, TripController.insert);
router.get('/trips', authenticate, TripController.getUserTripsWithDeals);
router.get('/trip/:tripId', authenticate, TripController.getUserTripWithDeals);
router.get('/trips/all', authenticateAdmin, TripController.getAllTrips);

// router.post('/deal/:dealId', authenticateAdmin, DealController.update);
router.post('/deal', authenticateAdmin, DealController.insert);
router.get('/deal/:dealId', DealController.getOne);
router.get('/deals', DealController.get);
router.get('/recentDeals', DealController.getMostRecent); // Landing Page Deals

router.get('/flights', authenticateAdmin, FlightController.get);
router.post('/flight', authenticateAdmin, FlightController.insert);
router.delete('/flight/:flightId', authenticateAdmin, FlightController.delete);

router.get('/airports', authenticate, AirportController.getSuggestions);

module.exports = router;
