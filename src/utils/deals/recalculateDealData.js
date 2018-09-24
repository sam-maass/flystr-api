const DealModel = require('../../model/dealModel');
const moment = require('moment');

const recalculateDealData = async ({ _id }) => {
  const dealData = await DealModel.findById(_id).populate('exampleFlights');
  const flights = dealData.exampleFlights;
  const destinations = [
    ...new Set([...flights.map(flight => flight.outDestination)])
  ];
  const currency = flights[0].currency || 'EUR';
  const origins = [...new Set([...flights.map(flight => flight.outOrigin)])];
  const minPrice = Math.min(...flights.map(f => f.price).filter(v => v >= 0));
  const firstDeparture = moment
    .min(...flights.map(f => moment(f.outDate)))
    .format('YYYY-MM-DD');
  const lastReturn = moment
    .max(...flights.map(f => moment(f.inDate)))
    .format('YYYY-MM-DD');
  console.log({
    destinations,
    currency,
    origins,
    minPrice,
    firstDeparture,
    lastReturn
  });

  await DealModel.findByIdAndUpdate(_id, {
    $set: {
      destinations,
      currency,
      origins,
      minPrice,
      firstDeparture,
      lastReturn
    }
  });
};
exports.recalculateDealData = recalculateDealData;
