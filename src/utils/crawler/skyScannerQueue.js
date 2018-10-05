const { getQuotes } = require('./getQuotes');
const skyScannerQueue = [];
const SkycannerApiLimitPerMinute = 600;

export function addToSkyscannerQueue(item) {
  return skyScannerQueue.push(item);
}

setInterval(() => {
  const nextQuoteRequest = skyScannerQueue.shift();
  if (nextQuoteRequest) {
    getQuotes(nextQuoteRequest);
    console.log(`${skyScannerQueue.length} items left in queue`);
  }
}, (1000 * 60) / SkycannerApiLimitPerMinute);
