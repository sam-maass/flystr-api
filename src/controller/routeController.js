import { RouteModel } from '../model/routeModel';
import { AirportModel } from '../model/airportModel';
import slugify from 'slugify';

export default {
  get: async (req, res) => {
    const routes = await RouteModel.find({
      removed: { $ne: true }
    })
      .populate('origin')
      .populate('destination')
      .sort({
        createdAt: -1
      });
    res.status(200).json(routes);
  },

  addMultiple: async (req, res) => {
    const { routes } = req.body;
    if (!routes) return;
    routes.forEach(async route => {
      const origin = await AirportModel.findOne({ iata: route.origin });
      const destination = await AirportModel.findOne({
        iata: route.destination
      });
      const originName = origin.city;
      const destinationName = destination.city;
      const slug = slugify(
        `${originName}-to-${destinationName}_${origin.iata}-${
          destination.iata
        }`,
        { lower: true }
      );
      route = new RouteModel({
        origin,
        destination,
        slug,
        originName,
        destinationName
      });
      await route.save();
    });
    res.send('ok');
  },

  delete: async (req, res) => {
    const { routeId } = req.query;
    if (!routeId) return res.status(500).json({ error: 'no route id' });
    await RouteModel.remove({ _id: routeId });
    res.status(200).json({ removed: true });
  },

  update: async (req, res) => {
    const { routeId, isPublishedAsDeal } = req.body;
    console.log(req.body);

    if (!routeId) return res.status(500).json({ error: 'no route id' });
    const resq = await RouteModel.updateOne(
      { _id: routeId },
      { $set: { isPublishedAsDeal } }
    );
    console.log(resq);

    res.status(200).json({ updated: true });
  }
};
