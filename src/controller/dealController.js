const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const FligthModel = require('../model/flightModel');
const FlightController = require('./flightController');
const moment = require('moment');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({})
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
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
  },

  update: async (req, res) => {
    const deal = await DealModel.findById(req.params.dealId);
    const {
      title,
      subtitle,
      origins,
      destinations,
      minPrice,
      firstDepature,
      lastReturn,
      exampleFlights: newFlights
    } = req.body;

    // insert all flights without id
    const shouldInsert = newFlights.filter(flight => !flight._id);

    // update all flights with id
    const shouldUpdate = newFlights.filter(flight => flight._id);

    // delete all flights that had an id but are not mentioned in newFlights
    const newFlightIds = newFlights.map(flight => flight._id);

    const shouldDelete = deal.exampleFlights
      .map(flight => flight._id)
      .filter(flightId => !newFlightIds.includes(`${flightId}`));

    const insertedFlightIds = await insertFlights(shouldInsert);
    await updateFlights(shouldUpdate);
    await FligthModel.remove({ _id: { $in: shouldDelete } });

    const exampleFlights = [...deal.exampleFlights, ...insertedFlightIds];

    await deal.update({
      $set: {
        title,
        subtitle,
        origins,
        destinations,
        minPrice,
        firstDepature,
        lastReturn,
        exampleFlights
      }
    });
    await deal.update({
      $pull: { exampleFlights: { $in: shouldDelete } }
    });
    res.status(200).json(deal);
  }
};

async function insertDeal(reqBody, flightIds, user) {
  const deal = new DealModel({
    ...reqBody,
    exampleFlights: flightIds,
    user
  });
  await deal.save();
  return deal;
}

async function insertFlights(exampleFlights) {
  const flightsWithDuration = calcFlightDuration(exampleFlights);

  const flights = await FligthModel.insertMany(flightsWithDuration);
  const flightIds = flights.map(flight => flight._id);
  return flightIds;
}

function calcFlightDuration(exampleFlights) {
  return exampleFlights.map(flight => {
    return {
      ...flight,
      duration: moment(flight.inDate, 'YYYY-MM-DD').diff(
        moment(flight.outDate, 'YYYY-MM-DD'),
        'days'
      )
    };
  });
}

async function updateFlights(exampleFlights) {
  console.log(exampleFlights);

  const flightsWithDuration = calcFlightDuration(exampleFlights);

  flightsWithDuration.forEach(async flight => {
    await FligthModel.update({ _id: flight._id }, { $set: { ...flight } });
  });
}
