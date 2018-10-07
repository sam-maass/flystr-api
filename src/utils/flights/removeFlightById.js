import { removeFlightFromDeal } from '../deals/removeFlightFromDeal';
import { removeFlightFromTrip } from '../trips/removeFlightFromTrip';
import FlightModel from '../../model/flightModel';

export async function removeFlightById(flightId) {
  console.log(`removing flight ${flightId}`);

  await FlightModel.deleteOne({ _id: flightId });
  await removeFlightFromDeal(flightId);
  await removeFlightFromTrip(flightId);
}
