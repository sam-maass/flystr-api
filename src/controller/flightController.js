import { insertFlight } from '../utils/flights/insertFlight';

import { FlightModel } from '../model/flightModel';

import { removeFlightById } from '../utils/flights/removeFlightById';

export default {
  get: async (req, res) => {
    const flights = await FlightModel.find({
      removed: { $ne: true },
      manuallyAdded: true
    }).sort({
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
    const { flight: flightData } = req.body;
    const flight = await insertFlight(flightData);
    res.status(200).json({ ...flight });
  }
};
