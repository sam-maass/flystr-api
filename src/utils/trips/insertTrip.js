const { findMatchingFlights } = require('./findMatchingFlights');
const { findDealsForTrips } = require('../crawler/findDealsForTrips');

const TripModel = require('../../model/tripModel');

export async function insertTrip(tripData, user) {
  const matchingFlights = await findMatchingFlights(tripData);
  const trip = new TripModel({
    ...tripData,
    user,
    matchingFlights
  });
  await trip.save();
  findDealsForTrips([trip]);
  return trip;
}
