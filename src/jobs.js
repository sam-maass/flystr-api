const { findDealsForAllTrips } = require('./utils/crawler/findDealsForTrips');
const { removeOldFlights } = require('./utils/flights/removeOldFlights');

const FlightModel = require('./model/flightModel');
const DealControlller = require('./controller/dealController');

setInterval(async () => {
  const flights = await FlightModel.find({
    outDate: { $lte: new Date() },
    removed: { $ne: true }
  });

  const ids = flights.map(f => f._id);
  // TODO: use util to remove flight
  DealControlller._removeFlights(ids);
  FlightModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } }
  ).exec();
}, 1 * 60 * 60 * 1000); // 1 hour

// Update Flights every 6 hours
setInterval(() => {
  findDealsForAllTrips();
  removeOldFlights();
}, 6 * 60 * 60 * 1000);

findDealsForAllTrips();
