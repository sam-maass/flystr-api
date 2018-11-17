const express = require('express'),
  router = express.Router();

import UserController from './controller/userController';
import TripController from './controller/tripController';
import DealController from './controller/dealController';
import FlightController from './controller/flightController';
import AirportController from './controller/airportController';
import NotificationController from './controller/notificationController';
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
router.post('/user/premiumSignup', authenticate, UserController.premiumSignup);
router.put('/user', authenticate, UserController.update);
router.get('/user/refreshToken', authenticate, UserController.refreshToken);
router.get('/user/profile', authenticate, UserController.getProfile);
router.get('/user/notifications', authenticate, NotificationController.get);
router.put(
  '/user/notifications/seen',
  authenticate,
  NotificationController.markAsRead
);
router.get('/push-notification/:notificationId', NotificationController.getOne);

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
