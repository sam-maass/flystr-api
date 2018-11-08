import DealModel from '../../model/dealModel';
import moment from 'moment';

export const recalculateDealData = async ({ _id }) => {
  const deal = await DealModel.findById(_id).populate('exampleFlights');
  const { exampleFlights: flights } = deal;
  let { priceLimit } = deal;
  const destinations = [
    ...new Set([...flights.map(flight => flight.outDestination)])
  ];
  const currency = flights[0].currency || 'EUR';
  const origins = [...new Set([...flights.map(flight => flight.outOrigin)])];
  const minPrice = Math.min(...flights.map(f => f.price).filter(v => v >= 0));
  const lastChecked = Math.max(...flights.map(f => f.createdAt));
  const firstDeparture = moment
    .min(...flights.map(f => moment(f.outDate)))
    .format('YYYY-MM-DD');
  const lastReturn = moment
    .max(...flights.map(f => moment(f.inDate)))
    .format('YYYY-MM-DD');
  if (!priceLimit) priceLimit = minPrice * 1.35;

  await DealModel.findByIdAndUpdate(_id, {
    $set: {
      priceLimit,
      lastChecked,
      destinations,
      currency,
      origins,
      minPrice,
      firstDeparture,
      lastReturn
    }
  });
};
