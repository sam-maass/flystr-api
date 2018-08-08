const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const FligthModel = require('../model/flightModel');
const FlightController = require('./flightController');
const moment = require('moment');

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
      const deal = await insertDeal(req.body, flightIds, user);
      FlightController._matchFlightsWithTrips(flightIds);
      res.status(200).json(deal);
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};

async function insertDeal(reqBody, flightIds, user) {
  const deal = new DealModel({
    ...reqBody,
    exampleFlights: flightIds,
    user,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  await deal.save();
  return deal;
}

async function insertFlights(exampleFlights) {
  const flightsWithDuration = exampleFlights.map(flight => {
    return {
      ...flight,
      duration: moment(flight.inDate, 'YYYY-MM-DD').diff(
        moment(flight.outDate, 'YYYY-MM-DD'),
        'days'
      )
    };
  });
  console.log(flightsWithDuration);

  const flights = await FligthModel.insertMany(flightsWithDuration);
  const flightIds = flights.map(flight => flight._id);
  return flightIds;
}
