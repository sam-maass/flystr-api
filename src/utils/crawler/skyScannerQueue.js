import { getQuotes } from './getQuotes';
const skyScannerQueue = [];
const SKYSCANNER_RATE_LIMIT = 300;

export function addToSkyscannerQueue(item) {
  return skyScannerQueue.push(item);
}

setInterval(() => {
  const nextQuoteRequest = skyScannerQueue.shift();
  if (nextQuoteRequest) {
    getQuotes(nextQuoteRequest);
    console.log(`${skyScannerQueue.length} items left in queue`);
  }
}, (1000 * 60) / SKYSCANNER_RATE_LIMIT);
