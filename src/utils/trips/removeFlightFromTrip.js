const TripModel = require('../../model/tripModel');
async function removeFlightFromTrip(flightId) {
  await TripModel.updateMany(
    { matchingFlights: { $in: [flightId] } },
    {
      $pull: { matchingFlights: { $in: [flightId] } }
    }
  );
}
exports.removeFlightFromTrip = removeFlightFromTrip;
