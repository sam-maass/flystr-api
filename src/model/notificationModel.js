import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const notificationModel = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    payload: Object,
    seenByUser: Boolean
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model('Notification', notificationModel);

module.exports = NotificationModel;
