const DealModel = require('../model/dealModel');
const TripModel = require('../model/tripModel');
const UserModel = require('../model/userModel');
var webpush = require('web-push')

module.exports = {
  get: async (req, res, next) => {
    const deals = await DealModel.find({ _id: { $in: req.query.ids } });
    res.status(200).json(deals);
  },
  getAll: async (req, res, next) => {
    const trips = await TripModel.find({ user: req.user._id }).distinct(
      'matchingDeals'
    );
    const deals = await DealModel.find({
      _id: { $in: trips }
    });
    res.status(200).json(deals);
  },

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
        function (err, raw) {
          if (err) return handleError(err);
        }
      );

      // send notifications
      const vapidKeys = {
        publicKey:
          'BAgeVyCdHekqEgMypZhwIintYTfGRJO37nY0FQxsFXrWG_Pbhn_5yKUDd-K3ccVNT_-2LiEG4xNUe1qz9MFrCV4',
        privateKey: '***REDACTED***'
      };

      webpush.setVapidDetails(
        'mailto:web-push-book@gauntface.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      const trips = await TripModel.find({ matchingDeals: deal._id })
      const userIds = ['5a6788e9a2152863eb72fee7']
      console.log('userIds', userIds);
      const users = await UserModel.find({ _id: { $in: userIds } })

      const dataToSend = {
        notification: {
          title: 'New Deal',
          body: 'Somebody created a new deal'
        }
      }

      users.forEach(user => {
        webpush.sendNotification(user.pushSubscription, 'dataToSend').then(res => console.log(res)).catch((err) => {
          if (err.statusCode === 410) {
            return deleteSubscriptionFromDatabase(subscription._id);
          } else {
            console.log('Subscription is no longer valid: ', err);
          }
        });
      })

      res.status(200).json(deal);
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
