import { getRelevantDeals } from '../utils/deals/getRelevantDeals';
import DealModel from '../model/dealModel';
import TripModel from '../model/tripModel';
import UserModel from '../model/userModel';
import { insertDeal } from '../utils/deals/insertDeal';
import { AirportModel } from '../model/airportModel';
import { FlightModel } from '../model/flightModel';

const limitRemovedDeals = (deals, { limit }) => {
  let removedInResult = 0;
  return deals.filter(deal => {
    if (!deal.removed) return true;
    if (deal.removed && removedInResult < limit) {
      removedInResult++;
      return true;
    }
    return false;
  });
};

export default {
  get: async (req, res) => {
    console.log(req.query);

    const { activeDeal, region, departureDatePartial, duration } = req.query;
    let deals = [];

    // seperate logic if active deal is set
    if (activeDeal) {
      deals = await getRelevantDeals(activeDeal);
      const limitedDeals = limitRemovedDeals(deals, { limit: 2 });
      res.status(200).json(limitedDeals);
      return;
    }

    if (!activeDeal) {
      let origins = { $exists: true }; //default search
      if (region) {
        const validDepartureAirports = await AirportModel.find({
          country: { $regex: new RegExp(region.replace('-', '.'), 'i') }
        });
        origins = { $in: validDepartureAirports.map(a => a.iata) };
      }

      if (!(departureDatePartial || duration)) {
        deals = await DealModel.find(
          { origins },
          { exampleFlights: 0, priceHistory: 0 }
        ).sort({ saving: -1 });
      } else {
        const unwindStage = [
          { $unwind: { path: '$priceMatrix' } },
          { $unwind: { path: '$priceMatrix' } }
        ];
        const transformPriceMatrixStage = [
          { $sort: { 'priceMatrix.minPrice': 1 } },
          {
            $group: {
              _id: '$_id',
              minPrice: { $min: '$priceMatrix.minPrice' },
              doc: { $first: '$$ROOT' }
            }
          },
          { $replaceRoot: { newRoot: '$doc' } },
          {
            $addFields: {
              minPrice: '$priceMatrix.minPrice',
              saving: { $divide: ['$priceMatrix.minPrice', '$averagePrice'] }
            }
          },
          { $sort: { saving: 1 } }
        ];
        const matchOriginStage = region ? [{ $match: { origins } }] : [];
        const matchDateStage = departureDatePartial
          ? [{ $match: { 'priceMatrix.month': departureDatePartial } }]
          : [];
        const matchDurationStage = duration
          ? [{ $match: { 'priceMatrix.duration': duration } }]
          : [];

        deals = await DealModel.aggregate([
          ...matchOriginStage,
          ...unwindStage,
          ...matchDateStage,
          ...matchDurationStage,
          ...transformPriceMatrixStage
        ]);
      }

      const limitedDeals = limitRemovedDeals(deals, { limit: 2 });
      res.status(200).json(limitedDeals);
    }
  },

  getCountries: async (req, res) => {
    const origins = await DealModel.aggregate([
      { $match: { removed: { $ne: true } } },
      { $unwind: '$origins' },
      { $group: { _id: '$origins' } }
    ]);
    const countries = await AirportModel.aggregate([
      { $match: { iata: { $in: origins.map(i => i._id) } } },
      { $group: { _id: '$country' } },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json({ countries: countries.map(i => i._id) });
  },

  getMostRecent: async (req, res) => {
    const deals = await DealModel.find({ removed: { $ne: true } })
      .limit(3)
      .sort({ saving: -1 });
    res.status(200).json(deals);
  },

  getOne: async (req, res) => {
    console.time('getOne');
    const deal = await DealModel.findOne({
      slug: req.params.dealId,
      removed: {
        $ne: true
      }
    });
    deal.exampleFlights = await FlightModel.find({
      outOrigin: { $in: deal.origins },
      outDestination: { $in: deal.destinations },
      removed: { $ne: true }
    })
      .sort({ price: 1 })
      .limit(200);
    if (!deal) return res.status(404).json({ error: 'No Deal found' });
    res.status(200).json(deal);
    console.timeEnd('getOne');
  },

  insert: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const { title, subtitle, exampleFlights, tripId } = req.body;
      let flights = exampleFlights;
      if (tripId) {
        const { matchingFlights } = await TripModel.findById(tripId);
        flights = matchingFlights;
      }
      const deal = await insertDeal(title, subtitle, flights, user);
      res.status(200).json({ deal });
    } else {
      res.status(500).json({ error: 'Unable to save deal' });
    }
  }
};
