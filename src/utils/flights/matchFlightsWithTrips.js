const TripModel = require('../../model/tripModel');
const FlightModel = require('../../model/flightModel');

async function matchFlightsWithTrips(flightIds) {
  console.log({ flightIds });

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
          $or: [{ toDuration: null }, { toDuration: { $gte: flight.duration } }]
        }
      ],
      startDate: { $lte: flight.outDate },
      endDate: { $gte: flight.inDate },
      budget: { $gte: flight.price }
    };
    console.log(query);

    await TripModel.updateMany(query, {
      $addToSet: { matchingFlights: flight }
    });
  });
}

exports.matchFlightsWithTrips = matchFlightsWithTrips;
