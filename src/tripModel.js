const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destination: String,
  date: String
});

const TripModel = mongoose.model('trip', tripSchema);

module.exports = TripModel;
