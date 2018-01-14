const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');

module.exports = {
  insert: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const trip = new TripModel({
        ...req.body,
        destinations: req.body.destinations.split(','),
        origins: req.body.origins.split(','),
        user,
        createdAt: new Date(),
        updatedAt: new Date()
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
  }
};
