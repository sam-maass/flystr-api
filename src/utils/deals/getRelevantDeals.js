//@ts-check
import DealModel from '../../model/dealModel';

/**
 * Gets a list of all relevant deals
 *
 * @export
 * @param {string} activeDeal
 */
export async function getRelevantDeals(activeDeal) {
  const deal = await getExactDeal(activeDeal);
  if (!deal) {
    return DealModel.find({ removed: { $ne: true } }).sort({ createdAt: -1 });
  }
  const origins = deal ? deal.origins : [];
  const sameAirportDeals = await getSameOriginDeals(activeDeal, origins);
  const otherDeals = await getOtherDeals(activeDeal, origins);
  const deals = [deal, ...sameAirportDeals, ...otherDeals];
  return deals;
}

/**
 * Get deals with different origin
 *
 * @param {string} slug
 * @param {string[]} origins
 */
async function getOtherDeals(slug, origins) {
  return await DealModel.find({
    slug: { $ne: slug },
    origins: { $nin: origins }
  }).sort({ createdAt: -1 });
}

/**
 * Get deals with same origin
 *
 * @param {string} slug
 * @param {string[]} origins
 */
function getSameOriginDeals(slug, origins) {
  return DealModel.find({
    removed: { $ne: true },
    slug: { $ne: slug },
    origins: { $in: origins }
  }).sort({ createdAt: -1 });
}

/**
 *  Gets deal by slug
 *
 * @param {string} slug
 */
async function getExactDeal(slug) {
  return await DealModel.findOne({
    slug
  });
}
