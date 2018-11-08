import { getRelevantDeals } from '../utils/deals/getRelevantDeals';
import { crawler } from '../utils/skyscannerCrawler';

import { recalculateDealData } from '../utils/deals/recalculateDealData';
import DealModel from '../model/dealModel';
import UserModel from '../model/userModel';
import slugify from 'slugify';

const limitRemovedDeals = (deals, { limit }) => {
  let removedInResult = 0;
  return deals.filter(deal => {
    if (!deal.removed) return true;
    if (deal.removed && removedInResult < limit) {
      removedInResult++;
      return true;
    }
    return false;
  });
};

module.exports = {
  get: async (req, res) => {
    const { activeDeal } = req.query;
    if (activeDeal) {
      const deals = await getRelevantDeals(activeDeal);
      const limitedDeals = limitRemovedDeals(deals, { limit: 5 });
      res.status(200).json(limitedDeals);
    } else {
      const deals = await DealModel.find()
        .sort({ createdAt: -1 })
        .populate('exampleFlights');
      const limitedDeals = limitRemovedDeals(deals, { limit: 5 });
      res.status(200).json(limitedDeals);
    }
  },

  getMostRecent: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .limit(3)
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    let deal = await DealModel.findOne({
      slug: req.params.dealId,
      removed: {
        $ne: true
      }
    }).populate('exampleFlights');
    if (!deal) {
      deal = await DealModel.findOne({
        _id: req.params.dealId,
        removed: { $ne: true }
      }).populate('exampleFlights');
    }
    if (!deal) return res.status(404).json({ error: 'No Deal found' });
    res.status(200).json(deal);
  },

  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const { title, subtitle, exampleFlights } = req.body;
      const deal = new DealModel({
        title,
        subtitle,
        exampleFlights,
        user,
        slug: slugify(`${title} from ${subtitle}`, { lower: true })
      });
      await deal.save();
      console.log(deal);

      await recalculateDealData(deal._id);
      crawler(`/crawl/deals/${deal._id}`);
      res.status(200).json({ deal });
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
