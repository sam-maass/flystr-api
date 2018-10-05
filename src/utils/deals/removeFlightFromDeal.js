import { removeEmptyDeals } from './removeEmptyDeals';
import { recalculateDealData } from './recalculateDealData';
import DealModel from '../../model/dealModel';
export async function removeFlightFromDeal(flightId) {
  const deals = await DealModel.find({
    exampleFlights: { $in: [flightId] }
  });
  await DealModel.updateMany({
    $pull: { exampleFlights: { $in: [flightId] } }
  });
  deals.forEach(recalculateDealData);
  await removeEmptyDeals();
}
