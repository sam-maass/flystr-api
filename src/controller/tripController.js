import { insertTrip } from '../utils/trips/insertTrip';
import { findMatchingFlights } from '../utils/trips/findMatchingFlights';

import TripModel from '../model/tripModel';
import UserModel from '../model/userModel';

const FREE_USER_TRIP_LIMIT = 2;

module.exports = {
  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(500).json({ error: 'Unable to save trip' });
    }
    const userTrips = await TripModel.find({ user: req.user._id });
    if (
      !user.stripeSubscription &&
      userTrips.length + 1 > FREE_USER_TRIP_LIMIT
    ) {
      return res.status(500).json({
        error: 'Free Account limit reached. Upgrade to Premium for more trips'
      });
    }
    const tripData = req.body;
    const trip = await insertTrip(tripData, user);
    res.status(200).json(trip);
  },

  update: async (req, res) => {
    const tripId = req.params.tripId;
    const matchingFlights = await findMatchingFlights(req.body);
    const trip = await TripModel.updateMany(
      { _id: tripId },
      {
        ...req.body,
        matchingFlights
      }
    );
    res.status(200).json(trip);
  },

  delete: async (req, res) => {
    const tripId = req.params.tripId;
    const trip = await TripModel.findById(tripId);
    if (!trip) {
      res.status(500).json({ error: 'Unable to find trip' });
    } else {
      trip.remove();
      res.status(200).json({ removed: true });
    }
  },

  getAllTrips: async (req, res) => {
    const trips = await TripModel.find().sort({ createdAt: -1 });
    res.status(200).json(trips);
  },

  getUserTrips: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({ user: req.user._id }).sort({
        createdAt: -1
      });
      res.status(200).json(trips);
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  },

  getUserTripsWithDeals: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trip = await TripModel.find({
        user: req.user._id,
        matchingFlights: { $ne: [] }
      })
        .populate('matchingFlights')
        .sort({ createdAt: -1 });
      res.status(200).json(trip);
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  },

  getUserTripWithDeals: async (req, res) => {
    const tripId = req.params.tripId;
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trip = await TripModel.findOne({
        _id: tripId,
        user: req.user._id
      }).populate('matchingFlights');
      res.status(200).json(trip);
    } else res.status(500).json({ error: 'Unable to find user' });
  }
};
