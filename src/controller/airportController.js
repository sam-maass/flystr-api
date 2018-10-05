import AirportModel from '../model/airportModel';

module.exports = {
  getSuggestions: async (req, res) => {
    const term = req.query.term;
    const rx = new RegExp(term, 'i');
    const airportsByIata = await AirportModel.find({ iata: rx }).limit(2);
    const airportsByCity = await AirportModel.find({
      city: rx,
      iata: { $exists: true, $ne: '' }
    }).limit(3);

    const airports = [...airportsByIata, ...airportsByCity];
    const result = airports.map(airport => {
      return {
        label: `${airport.iata} ${airport.city},${airport.country}`,
        value: airport.iata
      };
    });
    res.status(200).json(result);
  }
};
