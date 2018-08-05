const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealSchema = new Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date,
  title: String,
  minPrice: Number,
  origins: [String],
  destinations: [String],
  firstDeparture: Date,
  lastReturn: Date,
  exampleFlights: [
    {
      link: String,
      price: Number,
      inOrigin: String,
      inDestination: String,
      inDate: Date,
      inCarriers: String,
      outOrigin: String,
      outDestination: String,
      outDate: Date,
      outCarriers: String
    }
  ]
});

const DealModel = mongoose.model('Deal', dealSchema);

module.exports = DealModel;
