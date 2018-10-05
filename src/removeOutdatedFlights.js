import FlightModel from '../../model/flightModel';
import { removeFlightById } from './removeFlightById';
export async function removeOutdatedFlights() {
  const flights = await FlightModel.find({
    outDate: { $lte: new Date() },
    removed: { $ne: true }
  });
  const flightIds = flights.map(f => f._id);
  flightIds.forEach(removeFlightById);
}
