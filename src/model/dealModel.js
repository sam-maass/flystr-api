import mongoose from 'mongoose';
import { composeWithMongoose } from 'graphql-compose-mongoose/node8';

const Schema = mongoose.Schema;

const dealSchema = new Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedAt: Date,
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    minPrice: Number,
    origins: [String],
    destinations: [String],
    firstDeparture: Date,
    lastReturn: Date,
    exampleFlights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }],
    removed: Boolean,
    removedAt: Date,
    slug: String,
    currency: String,
    lastChecked: Date,
    priceLimit: Number,
    priceHistory: [{ date: Date, minPrice: Number }],
    averagePrice: Number,
    saving: Number,
    stDev: Number,
    rareness: Number
  },
  { timestamps: true }
);

const DealModel = mongoose.model('Deal', dealSchema);

const customizationOptions = {};
export const DealTC = composeWithMongoose(DealModel, customizationOptions);

export default DealModel;
