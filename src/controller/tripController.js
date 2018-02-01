const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');
const DealModel = require('../model/dealModel');

module.exports = {
  insert: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    let { budget, origins, destinations } = req.body;
    origins = origins.split(',');
    destinations = destinations.split(',');
    const tripsQuery = {
      price: { $lte: budget },
      origins: { $in: origins },
      destinations: { $in: destinations }
    };
    const matchingDeals = await DealModel.find(tripsQuery);
    if (user) {
      const trip = new TripModel({
        ...req.body,
        destinations,
        origins,
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
  getUserTrips: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({ user: req.user._id });
      res.status(200).json(trips);
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  },

  getUserTripsWithDeals: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trips = await TripModel.find({ user: req.user._id, matchingDeals: { $ne: [] } }).populate('matchingDeals');
      res.status(200).json(trips)
    } else {
      res.status(500).json({ error: 'Unable to find user' });
    }
  }
};
