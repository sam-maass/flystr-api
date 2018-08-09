const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');
const FlightModel = require('../model/flightModel');

module.exports = {
  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    const matchingFlights = await findMatchingFlights(req.body);
    if (user) {
      const trip = new TripModel({
        ...req.body,
        user,
        matchingFlights
      });
      await trip.save();
      res.status(200).json(trip);
    } else {
      res.status(500).json({ error: 'Unable to save trip' });
    }
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
      const trips = await TripModel.find({
        user: req.user._id,
        matchingFlights: { $ne: [] }
      })
        .sort({ createdAt: -1 })
        .populate('matchingFlights');
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
        matchingFlights: { $ne: [] }
      }).populate('matchingFlights');
      res.status(200).json(trips);
    } else res.status(500).json({ error: 'Unable to find user' });
  }
};

async function findMatchingFlights({
  budget,
  origins,
  destinations,
  startDate,
  endDate,
  fromDuration = 0,
  toDuration = 10000
}) {
  const tripsQuery = {
    outDate: { $gte: startDate },
    inDate: { $lte: endDate },
    price: { $lte: budget },
    outOrigin: { $in: origins },
    outDestination: { $in: destinations },
    duration: { $gte: fromDuration, $lte: toDuration }
  };
  const matchingFlights = FlightModel.find(tripsQuery);
  return matchingFlights;
}
