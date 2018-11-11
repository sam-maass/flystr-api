import NotificationModel from '../model/notificationModel';

module.exports = {
  get: async (req, res) => {
    const notifications = await NotificationModel.find({
      user: req.user._id
    }).sort({
      createdAt: -1
    });
    res.status(200).json(notifications);
  },

  getOne: async (req, res) => {
    const { notificationId } = req.params;
    if (!notificationId) return res.status(404);
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) return res.status(404);
    const options = {
      title: 'Flight Price Alert',

      body: `Your ${notification.payload.name} trip is now ${
        notification.payload.newPrice
      } EUR`,
      icon: 'https://flystr.com/logo192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: `https://flystr.com/trip/${notification.payload.trip}`
      }
    };
    res.status(200).json(options);
  },

  markAsRead: async (req, res) => {
    await NotificationModel.updateMany(
      { user: req.user._id },
      { $set: { seenByUser: true } }
    );
    res.status(200).json({});
  }
};
