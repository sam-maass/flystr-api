const { removeFlightFromDeal } = require('../deals/removeFlightFromDeal');
const { removeFlightFromTrip } = require('../trips/removeFlightFromTrip');
const FlightModel = require('../../model/flightModel');

async function removeFlightById(flightId) {
  await FlightModel.findByIdAndUpdate(flightId, {
    $set: { removed: true }
  });
  await removeFlightFromDeal(flightId);
  await removeFlightFromTrip(flightId);
}
exports.removeFlightById = removeFlightById;
