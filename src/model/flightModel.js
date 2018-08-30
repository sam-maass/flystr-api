const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const airport = {
  name: String,
  country: String,
  city: String,
  iata: String
};

const flightsSchema = new Schema(
  {
    link: String,
    price: Number,
    inOrigin: String,
    inOriginDetails: airport,
    inDestination: String,
    inDestinationDetails: airport,
    inDate: Date,
    inCarriers: String,
    outOrigin: String,
    outOriginDetails: airport,
    outDestination: String,
    outDestinationDetails: airport,
    outDate: Date,
    outCarriers: String,
    duration: Number,
    linkSource: String
  },
  { timestamps: true }
);

const DealModel = mongoose.model('Flight', flightsSchema);

module.exports = DealModel;
