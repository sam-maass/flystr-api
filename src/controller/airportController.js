import AirportModel from '../model/airportModel';
import slugify from 'slugify';

module.exports = {
  getSuggestions: async (req, res) => {
    const term = slugify(req.query.term, ' ');
    const rx = makeFuzzyRegex(term);
    const airportsByIata = await AirportModel.findOne({
      iata: rx
    });

    const foundAirportIata = (airportsByIata || {}).iata || ' ';
    const airportsByCity = await AirportModel.find({
      city: rx,
      iata: { $exists: true, $nin: ['', foundAirportIata] }
    }).limit(3);
    const airports = airportsByIata ? [airportsByIata] : [];
    airports.push(...airportsByCity);
    const result = airports.map(airport => {
      return {
        label: `${airport.iata} ${airport.city},${airport.country}`,
        value: airport.iata
      };
    });
    res.status(200).json(result);
  }
};

function makeFuzzyRegex(string) {
  if (!string) {
    return /^$/;
  }

  // Escape any potential special characters:
  const cleansed = string.replace(/\W/g, '\\$&');

  return RegExp(
    `^${cleansed.replace(
      // Find every escaped and non-escaped char:
      /(\\?.)/g,
      // Replace with fuzzy character matcher:
      '$1.?'
    )}.*$`,
    'i'
  );
}
