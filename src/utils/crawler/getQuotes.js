const { querySkyscanner } = require('./querySkyscanner');
const { insertFlight } = require('../flights/insertFlight');
const moment = require('moment');

export async function getQuotes({
  origin,
  destination,
  outboundPartialDate,
  inboundPartialDate,
  currency
}) {
  let queryResult;
  try {
    queryResult = await querySkyscanner({
      origin,
      destination,
      outboundPartialDate,
      inboundPartialDate,
      currency
    });
  } catch (error) {
    console.log(error);
  }
  if (!queryResult) return;
  const { Quotes, Carriers } = queryResult.body;
  const carrierMap = {};
  Carriers.forEach(c => {
    carrierMap[c.CarrierId] = c.Name;
  });
  const prices = Quotes.map(q => q.MinPrice);
  const absoluteMinPrice = Math.min(...prices);
  const bestOptions = Quotes.filter(
    q => q.MinPrice <= absoluteMinPrice * 1.2
  ).map(q => {
    const carriers = [
      ...new Set(q.OutboundLeg.CarrierIds, q.InboundLeg.CarrierIds)
    ];
    return {
      outOrigin: origin,
      outDestination: destination,
      inOrigin: destination,
      inDestination: origin,
      price: q.MinPrice,
      outDate: q.OutboundLeg.DepartureDate,
      inDate: q.InboundLeg.DepartureDate,
      carrier: carriers.map(id => carrierMap[id]).join(),
      link: `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${moment(
        q.OutboundLeg.DepartureDate
      ).format('YYMMDD')}/${moment(q.InboundLeg.DepartureDate).format(
        'YYMMDD'
      )}?locale=en-GB&market=DE&currency=EUR#results`
    };
  });
  bestOptions.forEach(option => insertFlight(option));
}
