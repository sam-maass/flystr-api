const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destinations: [String],
  origins: [String],
  startDate: Date,
  endDate: Date,
  price: Number,
  link: String,
  createdAt: Date,
  updatedAt: Date
});

const DealModel = mongoose.model('Deal', dealSchema);

module.exports = DealModel;
