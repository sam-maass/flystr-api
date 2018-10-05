import { findMatchingFlights } from './findMatchingFlights';
import { findDealsForTrips } from '../crawler/findDealsForTrips';

import TripModel from '../../model/tripModel';

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
