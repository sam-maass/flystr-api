import AirportModel from '../../model/airportModel';
import moment from 'moment';
export const augmentFlight = async flight => {
  delete flight._id;
  delete flight.createdAt;
  delete flight.updatedAt;
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
    inOriginDetails,
    inDestinationDetails,
    outOriginDetails,
    outDestinationDetails
  };
};
