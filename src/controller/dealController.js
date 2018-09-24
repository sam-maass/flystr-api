const DealModel = require('../model/dealModel');
const UserModel = require('../model/userModel');
const FlightModel = require('../model/flightModel');
const AirportModel = require('../model/airportModel');
const FlightController = require('./flightController');
const moment = require('moment');
const slugify = require('slugify');

module.exports = {
  get: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getMostRecent: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .limit(3)
      .sort({ createdAt: -1 })
      .populate('exampleFlights');
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    console.log('getOne');

    let deal = await DealModel.findOne({
      slug: req.params.dealId,
      removed: {
        $ne: true
      }
    }).populate('exampleFlights');
    if (!deal) {
      deal = await DealModel.findOne({
        _id: req.params.dealId,
        removed: { $ne: true }
      }).populate('exampleFlights');
    }
    if (!deal) return res.status(404).json({ error: 'No Deal found' });
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

  _removeFlights: async ids => {
    const relevantDeals = await DealModel.find({
      exampleFlights: { $in: ids }
    });
    await DealModel.updateMany(
      {},
      {
        $pull: { exampleFlights: { $in: ids } }
      }
    ).exec();
    relevantDeals.forEach(deal => {
      _updateDeal(deal._id);
    });
  },

  update: async (req, res) => {
    let deal = await DealModel.findOne({
      slug: req.params.dealId
    });
    if (!deal) {
      deal = await DealModel.findOne({
        _id: req.params.dealId
      });
    }

    console.log(deal);

    const {
      origins,
      destinations,
      minPrice,
      firstDepature,
      lastReturn,
      exampleFlights: newFlights
    } = req.body;

    const title = req.body.title || deal.title;
    const subtitle = req.body.subtitle || deal.subtitle;

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
    slug: slugify(`${reqBody.title} from ${reqBody.subtitle}`, { lower: true }),
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

const _updateDeal = async dealId => {
  const deal = await DealModel.findById(dealId).populate('exampleFlights');
  const leftFlights = deal.exampleFlights.length;
  if (leftFlights === 0) {
    deal.remove();
  } else {
    const _minPrice = Math.min(...deal.exampleFlights.map(f => f.price));
    const _lastReturn = new Date(
      Math.max(...deal.exampleFlights.map(f => f.inDate))
    );
    const _firstDeparture = new Date(
      Math.min(...deal.exampleFlights.map(f => f.outDate))
    );
    const _origins = [...new Set(deal.exampleFlights.map(f => f.outOrigin))];
    const _destinations = [
      ...new Set(deal.exampleFlights.map(f => f.outDestination))
    ];
    await DealModel.update(
      { _id: dealId },
      {
        $set: {
          minPrice: _minPrice,
          lastReturn: _lastReturn,
          firstDeparture: _firstDeparture,
          origins: _origins,
          destinations: _destinations
        }
      }
    );
  }
};
