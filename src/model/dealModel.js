const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealSchema = new Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedAt: Date,
    title: String,
    subtitle: String,
    minPrice: Number,
    origins: [String],
    destinations: [String],
    firstDeparture: Date,
    lastReturn: Date,
    exampleFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }]
  },
  { timestamps: true }
);

const DealModel = mongoose.model('Deal', dealSchema);

module.exports = DealModel;
