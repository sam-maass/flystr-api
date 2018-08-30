const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const FlightModel = require('../model/flightModel');
const AirportModel = require('../model/airportModel');
const FlightController = require('./flightController');
const moment = require('moment');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    const deal = await DealModel.findOne({
      _id: req.params.dealId,
      removed: { $ne: true }
    }).populate('exampleFlights');
    res.status(200).json(deal);
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
    await FlightModel.remove({ _id: { $in: shouldDelete } });
    const remainingFlights = deal.exampleFlights.filter(
      flight => !shouldDelete.includes(flight._id)
    );

    const exampleFlights = [...remainingFlights, ...insertedFlightIds];

    await deal.set({
      title,
      subtitle,
      origins,
      destinations,
      minPrice,
      firstDepature,
      lastReturn,
      exampleFlights
    });

    if (deal.exampleFlights[0] === undefined) {
      await deal.set({ removed: true, removedAt: new Date() });
    }
    deal.save();
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
  const augmentedFlights = exampleFlights
    .map(addDuration)
    .map(populateAirports);
  return await Promise.all(augmentedFlights).then(async augmentedFlights => {
    const flights = await FlightModel.insertMany(augmentedFlights);
    const flightIds = flights.map(flight => flight._id);
    return flightIds;
  });
}

const addDuration = flight => {
  return {
    ...flight,
    duration: moment(flight.inDate, 'YYYY-MM-DD').diff(
      moment(flight.outDate, 'YYYY-MM-DD'),
      'days'
    )
  };
};

const populateAirports = async flight => {
  const getAirport = iata =>
    AirportModel.findOne(
      {
        iata
      },
      'name country city iata'
    );
  const inOriginDetails = await getAirport(flight.inOrigin);
  const inDestinationDetails = await getAirport(flight.inDestination);
  const outOriginDetails = await getAirport(flight.outOrigin);
  const outDestinationDetails = await getAirport(flight.outDestination);
  return {
    ...flight,
    inOriginDetails,
    inDestinationDetails,
    outOriginDetails,
    outDestinationDetails
  };
};

async function updateFlights(exampleFlights) {
  exampleFlights.map(addDuration).forEach(async flight => {
    await FlightModel.update({ _id: flight._id }, { $set: { ...flight } });
  });
}
