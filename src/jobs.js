import { findDealsForAllTrips } from './utils/crawler/findDealsForTrips';
import { removeOldFlights } from './utils/flights/removeOldFlights';
import { removeOutdatedFlights } from './utils/flights/removeOutdatedFlights';

setInterval(() => {
  removeOutdatedFlights();
}, 1 * 60 * 60 * 1000); // 1 hour

// Update Flights every 6 hours
setInterval(() => {
  findDealsForAllTrips();
  removeOldFlights();
}, 6 * 60 * 60 * 1000);
