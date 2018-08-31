const mongoose = require('mongoose');
const DealControlller = require('../controller/dealController');

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
    linkSource: String,
    removed: Boolean
  },
  { timestamps: true }
);

const FlightModel = mongoose.model('Flight', flightsSchema);
setInterval(async () => {
  const flights = await FlightModel.find({
    outDate: { $lte: new Date() },
    removed: { $ne: true }
  });

  const ids = flights.map(f => f._id);

  DealControlller._removeFlights(ids);
  FlightModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } }
  ).exec();
}, 1 * 60 * 60 * 1000); // 1 hour

module.exports = FlightModel;
