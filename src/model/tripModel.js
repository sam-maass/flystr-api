const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tripSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    matchingFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }],
    destinations: [String],
    origins: [String],
    name: String,
    startDate: Date,
    endDate: Date,
    budget: Number,
    createdAt: Date,
    updatedAt: Date,
    fromDuration: Number,
    toDuration: Number
  },
  { timestamps: true }
);

const TripModel = mongoose.model('Trip', tripSchema);

module.exports = TripModel;
