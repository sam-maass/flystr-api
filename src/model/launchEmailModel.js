const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const launchEmailSchema = new Schema(
  {
    email: String,
    checkbox: Boolean,
    createdAt: Date
  },
  { timestamps: true }
);

const LauchEmailMModel = mongoose.model('Email', launchEmailSchema);

module.exports = LauchEmailMModel;
