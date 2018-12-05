import AirportModel from '../model/airportModel';
import slugify from 'slugify';

module.exports = {
  getSuggestions: async (req, res) => {
    const term = slugify(req.query.term, ' ');
    const rx = makeFuzzyRegex(term);
    const airportsByIata = await AirportModel.findOne({
      iata: rx,
      paxDemand: { $gte: 2 }
    });

    const foundAirportIata = (airportsByIata || {}).iata || ' ';
    let airportsByCity = await getAirportsByRegex(term, foundAirportIata, 0);
    if (airportsByCity.length === 0)
      airportsByCity = await getAirportsByRegex(term, foundAirportIata, 1);
    if (airportsByCity.length === 0)
      airportsByCity = await getAirportsByRegex(term, foundAirportIata, 2);
    const airports = airportsByIata ? [airportsByIata] : [];
    airports.push(...airportsByCity);
    const result = airports.map(airport => {
      const altNameString = airport.altNames.join('/');
      const altName =
        airport.city !== altNameString ? `(${altNameString})` : '';
      return {
        label: `${airport.city},${airport.country} ${altName}`,
        value: airport.iata
      };
    });
    res.status(200).json(result);
  }
};

async function getAirportsByRegex(term, excludedAirports, fuzzyness) {
  const rx = makeFuzzyRegex(term, fuzzyness);
  return await AirportModel.find({
    searchableName: rx,
    iata: { $exists: true, $nin: ['', excludedAirports] },
    paxDemand: { $gte: 2 }
  })
    .sort({ paxDemand: -1 })
    .limit(4);
}

function makeFuzzyRegex(string, fuzzyness = 0) {
  if (!string) {
    return /^$/;
  }

  const getFuzzyString = () => {
    switch (fuzzyness) {
      case 1:
        return '.?';
      case 2:
        return '.?.?';
      default:
        return '';
    }
  };

  // Escape any potential special characters:
  const cleansed = string.replace(/\W/g, '\\$&');

  return RegExp(
    `${cleansed.replace(
      // Find every escaped and non-escaped char:
      /(\\?.)/g,
      // Replace with fuzzy character matcher:
      `$1${getFuzzyString()}`
    )}.*$`,
    'i'
  );
}
