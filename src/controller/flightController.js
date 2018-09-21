const TripModel = require('../model/tripModel');
const FlightModel = require('../model/flightModel');

module.exports = {
  get: async (req, res) => {
    const flights = await FlightModel.find({ removed: { $ne: true } }).sort({
      createdAt: -1
    });
    res.status(200).json(flights);
  },

  delete: async (req, res) => {
    await FlightModel.findByIdAndUpdate(req.params.flightId, {
      $set: { removed: true }
    });
    res.status(200).json({ removed: true });
  },

  _matchFlightsWithTrips: async flightIds => {
    const flights = await FlightModel.find({ _id: { $in: flightIds } });
    flights.forEach(async flight => {
      const query = {
        destinations: flight.outDestination,
        origins: flight.outOrigin,
        $and: [
          {
            $or: [
              { fromDuration: null },
              { fromDuration: { $lte: flight.duration } }
            ]
          },
          {
            $or: [
              { toDuration: null },
              { toDuration: { $gte: flight.duration } }
            ]
          }
        ],
        startDate: { $lte: flight.outDate },
        endDate: { $gte: flight.inDate },
        budget: { $gte: flight.price }
      };

      await TripModel.updateMany(query, {
        $addToSet: { matchingFlights: flight }
      });
    });
  }
};
