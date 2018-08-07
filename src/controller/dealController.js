const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const FligthModel = require('../model/flightModel');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({}).populate('exampleFlights');
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    const deals = await DealModel.findOne({ _id: req.params.dealId }).populate(
      'exampleFlights'
    );
    res.status(200).json(deals);
  },

  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const flightIds = await insertFlights(req.body.exampleFlights);
      const deal = new DealModel({
        ...req.body,
        exampleFlights: flightIds,
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await deal.save();
      res.status(200).json(deal);
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};

async function insertFlights(exampleFlights) {
  const flights = await FligthModel.insertMany(exampleFlights);
  const flightIds = flights.map(flight => flight._id);
  return flightIds;
}
