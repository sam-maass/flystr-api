const { recalculateDealData } = require('../utils/deals/recalculateDealData');
const TripModel = require('../model/tripModel');
const FlightModel = require('../model/flightModel');
const DealModel = require('../model/dealModel');
const AirportModel = require('../model/airportModel');
const moment = require('moment');

module.exports = {
  get: async (req, res) => {
    const flights = await FlightModel.find({ removed: { $ne: true } }).sort({
      createdAt: -1
    });
    res.status(200).json(flights);
  },

  delete: async (req, res) => {
    const { flightId } = req.params;
    if (!flightId) return res.status(500).json({ error: 'no flight id' });
    await removeFlightById(flightId);

    res.status(200).json({ removed: true });
  },

  insert: async (req, res) => {
    const augmentedFlight = await augmentFlight(req.body.flight);
    console.log(augmentedFlight);

    const flight = new FlightModel(augmentedFlight);
    // check if it replaces old flight
    const oldFlight = await findDuplicateFlight(flight);

    await flight.save();

    if (oldFlight) {
      await replaceFlightFromDeal(oldFlight._id, flight._id);
      await removeFlightById(oldFlight._id);
      // add new flight to deal
    }
    res.status(200).json({ ...flight });
  },

  _matchFlightsWithTrips: async flightIds => {
    const flights = await FlightModel.find({ _id: { $in: flightIds } });
    flights.forEach(async flight => {
      const query = {
        destinations: flight.outDestination,
        origins: flight.outOrigin,
        $and: [
          {
            $or: [
              { fromDuration: null },
              { fromDuration: { $lte: flight.duration } }
            ]
          },
          {
            $or: [
              { toDuration: null },
              { toDuration: { $gte: flight.duration } }
            ]
          }
        ],
        startDate: { $lte: flight.outDate },
        endDate: { $gte: flight.inDate },
        budget: { $gte: flight.price }
      };

      await TripModel.updateMany(query, {
        $addToSet: { matchingFlights: flight }
      });
    });
  }
};

const augmentFlight = async flight => {
  const airportDetails = await populateAirports(flight);
  return {
    ...flight,
    ...addDuration(flight),
    ...airportDetails
  };
};

const addDuration = flight => {
  return {
    duration: moment(flight.inDate, 'YYYY-MM-DD').diff(
      moment(flight.outDate, 'YYYY-MM-DD'),
      'days'
    )
  };
};

const populateAirports = async flight => {
  console.log('populateAirports');

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
  console.log(flight.inOrigin, inOriginDetails);

  return {
    inOriginDetails,
    inDestinationDetails,
    outOriginDetails,
    outDestinationDetails
  };
};

async function findDuplicateFlight(flight) {
  const { outDate, inDate, outOrigin, outDestination } = flight;
  const oldFlight = await FlightModel.findOne({
    outDate,
    inDate,
    outOrigin,
    outDestination,
    removed: { $ne: true }
  });
  return oldFlight;
}

// Helper Functions
async function removeFlightById(flightId) {
  await FlightModel.findByIdAndUpdate(flightId, {
    $set: { removed: true }
  });
  await removeFlightFromDeal(flightId);
  await removeFlightTrip(flightId);
}

async function removeFlightFromDeal(flightId) {
  const deals = await DealModel.find({
    exampleFlights: { $in: [flightId] }
  });
  await DealModel.updateMany({
    $pull: { exampleFlights: { $in: [flightId] } }
  });
  deals.forEach(recalculateDealData);
  await removeEmptyDeals();
}

async function replaceFlightFromDeal(oldFlightId, newFlightId) {
  await DealModel.updateMany(
    { exampleFlights: { $in: [oldFlightId] } },
    {
      $push: { exampleFlights: newFlightId }
    }
  );
  removeFlightFromDeal(oldFlightId);
}

async function removeEmptyDeals() {
  await DealModel.updateMany(
    { exampleFlights: [] },
    { $set: { removed: true } }
  );
}

async function removeFlightTrip(flightId) {
  await TripModel.updateMany(
    { matchingFlights: { $in: [flightId] } },
    {
      $pull: { matchingFlights: { $in: [flightId] } }
    }
  );
}
