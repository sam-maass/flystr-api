import { crawler } from './utils/skyscannerCrawler';

// Update Flights every 3 hours
setInterval(() => {
  crawler('/crawl/trips/all');
  crawler('/crawl/deals/all');
}, 6 * 60 * 60 * 1000);
