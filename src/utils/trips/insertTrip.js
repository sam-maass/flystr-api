import { findMatchingFlights } from './findMatchingFlights';

import TripModel from '../../model/tripModel';
import { crawler } from '../skyscannerCrawler';

export async function insertTrip(tripData, user) {
  const matchingFlights = await findMatchingFlights(tripData);
  const minPrice = Math.min(
    ...matchingFlights.map(f => f.price).filter(v => v >= 0)
  );
  const trip = new TripModel({
    ...tripData,
    user,
    matchingFlights,
    minPrice,
    currency: 'EUR'
  });
  await trip.save();
  crawler(`/crawl/trips/${trip._id}`);
  return trip;
}
