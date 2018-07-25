const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');
const DealModel = require('../model/dealModel');

module.exports = {
  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    const { budget, origins, destinations } = req.body;
    const tripsQuery = {
      price: { $lte: budget },
      origins: { $in: origins },
      destinations: { $in: destinations }
    };
    const matchingDeals = await DealModel.find(tripsQuery);
    if (user) {
      const trip = new TripModel({
        ...req.body,
        user,
        createdAt: new Date(),
        updatedAt: new Date(),
        matchingDeals
      });
      await trip.save();
      res.status(200).json(trip);
    } else {
      res.status(500).json({ error: 'Unable to save trip' });
    }
  },

  update: async (req, res) => {
    const tripId = req.params.tripId;
    const trip = await TripModel.updateMany(
      { _id: tripId },
      {
        ...req.body
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

  getUserTrips: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({ user: req.user._id });
      res.status(200).json(trips);
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  },

  getUserTripsWithDeals: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({
        user: req.user._id,
        matchingDeals: { $ne: [] }
      }).populate('matchingDeals');
      res.status(200).json(trips);
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  },

  getUserTripWithDeals: async (req, res) => {
    const tripId = req.params.tripId;
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({
        _id: tripId,
        user: req.user._id,
        matchingDeals: { $ne: [] }
      }).populate('matchingDeals');
      res.status(200).json(trips);
    } else res.status(500).json({ error: 'Unable to find user' });
  }
};
