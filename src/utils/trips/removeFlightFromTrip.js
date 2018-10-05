const TripModel = require('../../model/tripModel');
export async function removeFlightFromTrip(flightId) {
  await TripModel.updateMany(
    { matchingFlights: { $in: [flightId] } },
    {
      $pull: { matchingFlights: { $in: [flightId] } }
    }
  );
}
