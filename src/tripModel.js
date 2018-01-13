const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destinations: [String],
  origins: [String],
  duration: Number,
  startDate: Date,
  endDate: Date,
  budget: Number,
  createdAt: Date,
  updatedAt: Date
});

const TripModel = mongoose.model('trip', tripSchema);

module.exports = TripModel;
