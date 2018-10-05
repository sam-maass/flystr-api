const { removeEmptyDeals } = require('./removeEmptyDeals');
const { recalculateDealData } = require('./recalculateDealData');
const DealModel = require('../../model/dealModel');
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
