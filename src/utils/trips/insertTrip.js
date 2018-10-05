import { findMatchingFlights } from './findMatchingFlights';

import TripModel from '../../model/tripModel';
import { crawler } from '../skyscannerCrawler';

export async function insertTrip(tripData, user) {
  const matchingFlights = await findMatchingFlights(tripData);
  const trip = new TripModel({
    ...tripData,
    user,
    matchingFlights
  });
  await trip.save();
  crawler(`/crawl/trips/${trip._id}`);
  return trip;
}
