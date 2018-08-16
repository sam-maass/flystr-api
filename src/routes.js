const express = require('express'),
  router = express.Router();

const UserController = require('./controller/userController');
const TripController = require('./controller/tripController');
const DealController = require('./controller/dealController');
const AirportController = require('./controller/airportController');
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
router.get('/trips/all', authenticateAdmin, TripController.getAllTrips);

router.post('/deal/:dealId', authenticateAdmin, DealController.update);
router.post('/deal', authenticateAdmin, DealController.insert);
router.get('/deal/:dealId', DealController.getOne);
router.get('/deals', DealController.get);

router.get('/airports', authenticate, AirportController.getSuggestions);

module.exports = router;
