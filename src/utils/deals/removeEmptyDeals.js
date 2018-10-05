const DealModel = require('../../model/dealModel');
export async function removeEmptyDeals() {
  await DealModel.updateMany(
    { exampleFlights: [] },
    { $set: { removed: true } }
  );
}
