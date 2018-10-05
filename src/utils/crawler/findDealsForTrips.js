const { cartesian } = require('./cartesian');

const TripModel = require('../../model/tripModel');
const { addToSkyscannerQueue } = require('./skyScannerQueue');
const moment = require('moment');
const PlannedRequests = new Set();
export const findDealsForAllTrips = async () => {
  const trips = await TripModel.find({ removed: { $ne: true } });
  findDealsForTrips(trips);
};

export function findDealsForTrips(trips) {
  const timeframes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(months =>
    moment()
      .add(months, 'months')
      .format('YYYY-MM')
  );
  //   console.log(trips);
  trips.forEach(trip => {
    const { origins, destinations } = trip;
    const combinations = cartesian(
      origins,
      destinations,
      timeframes,
      timeframes
    ).filter(combination => {
      if (
        moment(combination[2], 'YYYY-MM').isBefore(
          moment(combination[3], 'YYYY-MM')
        )
      )
        return true;
    });
    combinations.forEach(
      ([origin, destination, outboundPartialDate, inboundPartialDate]) => {
        PlannedRequests.add(
          JSON.stringify({
            origin,
            destination,
            outboundPartialDate,
            inboundPartialDate,
            currency: 'EUR'
          })
        );
      }
    );
    [...PlannedRequests]
      .map(item => JSON.parse(item))
      .forEach(request => addToSkyscannerQueue(request));
  });
}
