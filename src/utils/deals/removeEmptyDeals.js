const DealModel = require('../../model/dealModel');
async function removeEmptyDeals() {
  await DealModel.updateMany(
    { exampleFlights: [] },
    { $set: { removed: true } }
  );
}
exports.removeEmptyDeals = removeEmptyDeals;
