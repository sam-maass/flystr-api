const { recalculateDealData } = require('../utils/deals/recalculateDealData');
const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const slugify = require('slugify');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getMostRecent: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .limit(3)
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    console.log('getOne');

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

      recalculateDealData(deal._id);
      // const deal = await insertDeal(req.body, flightIds, user);
      // FlightController._matchFlightsWithTrips(flightIds);
      res.status(200).json({ deal });
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
