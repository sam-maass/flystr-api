import mongoose from 'mongoose';

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
    removed: Boolean,
    currency: String,
    manuallyAdded: Boolean
  },
  { timestamps: true }
);

const FlightModel = mongoose.model('Flight', flightsSchema);

module.exports = FlightModel;
