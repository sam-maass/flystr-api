import { crawler } from '../skyscannerCrawler';
import DealModel from '../../model/dealModel';
import slugify from 'slugify';
import { recalculateDealData } from './recalculateDealData';
export async function insertDeal(title, subtitle, exampleFlights, user) {
  const deal = new DealModel({
    title,
    subtitle,
    exampleFlights,
    user,
    slug: slugify(`${title} from ${subtitle}`, { lower: true })
  });
  await DealModel.deleteMany({ slug: deal.slug });
  await deal.save();
  await recalculateDealData(deal._id);
  crawler(`/crawl/deals/${deal._id}`);
  return deal;
}
