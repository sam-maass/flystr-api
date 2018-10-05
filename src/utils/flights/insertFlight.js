const FlightModel = require('../../model/flightModel');
const { findDuplicateFlight } = require('./findDuplicateFlight');
const { removeFlightById } = require('./removeFlightById');
const { replaceFlightFromDeal } = require('../deals/replaceFlightFromDeal');
const { augmentFlight } = require('./augmentFlight');
const { matchFlightsWithTrips } = require('./matchFlightsWithTrips');
export async function insertFlight(flightData) {
  const augmentedFlight = await augmentFlight(flightData);
  const flight = new FlightModel(augmentedFlight);
  // check if it replaces old flight
  const oldFlight = await findDuplicateFlight(flight);
  if (oldFlight) {
    await replaceFlightFromDeal(oldFlight._id, flight._id);
    await removeFlightById(oldFlight._id);
    // add new flight to deal
  }
  await flight.save();
  matchFlightsWithTrips([flight._id]);
  return flight;
}
