import FlightModel from '../../model/flightModel';
import { removeFlightById } from './removeFlightById';
import moment from 'moment';

export async function removeOldFlights() {
  const flights = await FlightModel.find({
    removed: { $ne: true },
    manuallyAdded: { $ne: true },
    createdAt: { $lte: moment().subtract(9, 'h') }
  });
  flights.forEach(removeFlightById);
}
