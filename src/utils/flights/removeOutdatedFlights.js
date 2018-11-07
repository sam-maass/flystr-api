import FlightModel from '../../model/flightModel';
import { removeFlightById } from './removeFlightById';
export async function removeOutdatedFlights() {
  console.log('removing outdated flights ...');

  const flights = await FlightModel.find({
    outDate: { $lte: new Date() },
    removed: { $ne: true }
  });
  console.log(`${flights.length}flights removed`);

  const flightIds = flights.map(f => f._id);
  flightIds.forEach(removeFlightById);
}
