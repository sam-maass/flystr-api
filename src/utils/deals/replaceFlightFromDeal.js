const { removeFlightFromDeal } = require('./removeFlightFromDeal');
const DealModel = require('../../model/dealModel');
export async function replaceFlightFromDeal(oldFlightId, newFlightId) {
  await DealModel.updateMany(
    { exampleFlights: { $in: [oldFlightId] } },
    {
      $push: { exampleFlights: newFlightId }
    }
  );
  removeFlightFromDeal(oldFlightId);
}
