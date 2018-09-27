const FlightModel = require('../model/flightModel');

const { findDuplicateFlight } = require('../utils/flights/findDuplicateFlight');
const { removeFlightById } = require('../utils/flights/removeFlightById');
const {
  replaceFlightFromDeal
} = require('../utils/deals/replaceFlightFromDeal');
const { augmentFlight } = require('../utils/flights/augmentFlight');

module.exports = {
  get: async (req, res) => {
    const flights = await FlightModel.find({ removed: { $ne: true } }).sort({
      createdAt: -1
    });
    res.status(200).json(flights);
  },

  delete: async (req, res) => {
    const { flightId } = req.params;
    if (!flightId) return res.status(500).json({ error: 'no flight id' });
    await removeFlightById(flightId);

    res.status(200).json({ removed: true });
  },

  insert: async (req, res) => {
    const augmentedFlight = await augmentFlight(req.body.flight);
    const flight = new FlightModel(augmentedFlight);
    await flight.save();

    // check if it replaces old flight
    const oldFlight = await findDuplicateFlight(flight);
    if (oldFlight) {
      await replaceFlightFromDeal(oldFlight._id, flight._id);
      await removeFlightById(oldFlight._id);
      // add new flight to deal
    }

    res.status(200).json({ ...flight });
  }
};
