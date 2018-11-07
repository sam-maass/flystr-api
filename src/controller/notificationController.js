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

  markAsRead: async (req, res) => {
    await NotificationModel.updateMany(
      { user: req.user._id },
      { $set: { seenByUser: true } }
    );
    res.status(200).json({});
  }
};
