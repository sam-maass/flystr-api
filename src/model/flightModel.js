const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const flightsSchema = new Schema({
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
});

const DealModel = mongoose.model('Flight', flightsSchema);

module.exports = DealModel;
