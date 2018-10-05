const FlightModel = require('../../model/flightModel');
export async function findDuplicateFlight(flight) {
  const { outDate, inDate, outOrigin, outDestination } = flight;
  const oldFlight = await FlightModel.findOne({
    outDate,
    inDate,
    outOrigin,
    outDestination,
    removed: { $ne: true }
  });
  return oldFlight;
}
