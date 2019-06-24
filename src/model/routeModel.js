import { Schema, model } from 'mongoose';

const routeSchema = new Schema(
  {
    currentMinPrice: Number,
    currentMinPriceCurrency: String,
    isPublishedAsDeal: { type: Boolean, default: false },
    lastCrawled: { type: Date, default: new Date(0) },
    createdAt: Date,
    updatedAt: Date,
    removedAt: Date,
    removed: Boolean,
    priceHistory: [{ date: Date, minPrice: Number }],
    medianPrice: Number,
    lowerEndPrice: Number,
    higherEndPrice: Number,
    saving: Number,
    savingAbsolute: Number,
    stDev: Number,
    rareness: Number,
    slug: { type: String, unique: true, required: true },
    flights: [{ type: Schema.Types.ObjectId, ref: 'Flight' }],
    origin: {
      type: Schema.Types.ObjectId,
      ref: 'Airport',
      required: true
    },
    originName: String,
    destination: {
      type: Schema.Types.ObjectId,
      ref: 'Airport',
      required: true
    },
    destinationName: String,
    priceMatrix: Array
  },
  { timestamps: true }
);

export const RouteModel = model('Route', routeSchema);
