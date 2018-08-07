const DealModel = require('../model/dealModel');
const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({});
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    const deals = await DealModel.findOne({ _id: req.params.dealId });
    res.status(200).json(deals);
  },

  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const deal = new DealModel({
        ...req.body,
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await deal.save();
      const tripsQuery = {
        budget: { $gte: deal.price },
        origins: { $in: deal.origins },
        destinations: { $in: deal.destinations }
      };

      TripModel.updateMany(
        tripsQuery,
        {
          $push: { matchingDeals: deal }
        },
        err => {
          if (err) return console.log(err);
        }
      );
      res.status(200).json(deal);
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
