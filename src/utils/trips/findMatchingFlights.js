import FlightModel from '../../model/flightModel';
export async function findMatchingFlights({
  budget,
  origins,
  destinations,
  startDate,
  endDate,
  fromDuration = 0,
  toDuration = 10000
}) {
  const tripsQuery = {
    outDate: { $gte: startDate },
    inDate: { $lte: endDate },
    outOrigin: { $in: origins },
    outDestination: { $in: destinations },
    removed: { $ne: true }
  };
  if (fromDuration >= 0 && fromDuration !== '') {
    tripsQuery.duration = { $gte: fromDuration, $lte: toDuration };
  }
  if (budget) {
    tripsQuery.price = { $lte: budget };
  }
  const matchingFlights = FlightModel.find(tripsQuery);
  return matchingFlights;
}
