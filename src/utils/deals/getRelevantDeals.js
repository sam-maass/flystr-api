const DealModel = require('../../model/dealModel');
async function getRelevantDeals(activeDeal) {
  const deal = await getExactDeal(activeDeal);
  const origins = deal ? deal[0].origins : [];
  const sameAirportDeals = await getSameOriginDeals(activeDeal, origins);
  const otherDeals = await getOtherDeals(activeDeal, origins);
  const deals = [...deal, ...sameAirportDeals, ...otherDeals];
  return deals;
}
exports.getRelevantDeals = getRelevantDeals;
async function getOtherDeals(activeDeal, origins) {
  return await DealModel.find({
    removed: { $ne: true },
    slug: { $ne: activeDeal },
    origins: { $nin: origins }
  })
    .sort({ createdAt: -1 })
    .populate('exampleFlights');
}

function getSameOriginDeals(activeDeal, origins) {
  return DealModel.find({
    removed: { $ne: true },
    slug: { $ne: activeDeal },
    origins: { $in: origins }
  })
    .sort({ createdAt: -1 })
    .populate('exampleFlights');
}

async function getExactDeal(activeDeal) {
  return await DealModel.find({
    removed: { $ne: true },
    slug: activeDeal
  }).populate('exampleFlights');
}
