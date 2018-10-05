import { removeFlightFromDeal } from './removeFlightFromDeal';
import DealModel from '../../model/dealModel';
export async function replaceFlightFromDeal(oldFlightId, newFlightId) {
  await DealModel.updateMany(
    { exampleFlights: { $in: [oldFlightId] } },
    {
      $push: { exampleFlights: newFlightId }
    }
  );
  removeFlightFromDeal(oldFlightId);
}
