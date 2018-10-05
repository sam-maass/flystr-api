import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CrawlPlanSchema = new Schema({
  id: String,
  origin: String,
  destination: String,
  lastCrawled: Date,
  lastReferenced: Date
});

const CrawlPlanModel = mongoose.model('Airport', CrawlPlanSchema);

CrawlPlanModel.index({ origin: 1, destination: 1 }, { unique: true });

module.exports = CrawlPlanModel;
