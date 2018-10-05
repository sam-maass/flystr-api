const FlightModel = require('../../model/flightModel');
const { removeFlightById } = require('./removeFlightById');
const moment = require('moment');

async function removeOldFlights() {
  const flights = await FlightModel.find({
    removed: { $ne: true },
    manuallyAdded: { $ne: true },
    createdAt: { $lte: moment().subtract(9, 'h') }
  });
  flights.forEach(removeFlightById);
}

exports.removeOldFlights = removeOldFlights;
