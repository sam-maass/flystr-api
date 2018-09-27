const TripModel = require('../../model/tripModel');
async function removeFlightFromTrip(flightId) {
  console.log('remove flight from trip');

  await TripModel.updateMany(
    { matchingFlights: { $in: [flightId] } },
    {
      $pull: { matchingFlights: { $in: [flightId] } }
    }
  );
}
exports.removeFlightFromTrip = removeFlightFromTrip;
