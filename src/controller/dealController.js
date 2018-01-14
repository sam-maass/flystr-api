const DealModel = require('../model/dealModel');
const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');

module.exports = {
  insert: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const deal = new DealModel({
        ...req.body,
        destinations: req.body.destinations.split(','),
        origins: req.body.origins.split(','),
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await deal.save();
      TripModel.updateMany(
        {
          budget: { $gte: deal.price },
          origins: { $in: deal.origins },
          destinations: { $in: deal.destinations }
        },
        {
          $push: { matchingDeals: deal }
        },
        function(err, raw) {
          if (err) return handleError(err);
        }
      );
      res.status(200).json(deal);
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
