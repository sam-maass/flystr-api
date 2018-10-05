import { removeOldFlights } from './utils/flights/removeOldFlights';
import { removeOutdatedFlights } from './utils/flights/removeOutdatedFlights';
import { crawler } from './utils/skyscannerCrawler';

setInterval(() => {
  removeOutdatedFlights();
}, 1 * 60 * 60 * 1000); // 1 hour

// Update Flights every 6 hours
setInterval(() => {
  crawler('/crawl/trips/all');
  removeOldFlights();
}, 6 * 60 * 60 * 1000);
