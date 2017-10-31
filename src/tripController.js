const TripModel = require('./tripModel');
const UserModel = require('./userModel');

module.exports = {
  insert: async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    console.log(req.body);
    if (user) {
      trip = new TripModel({ ...req.body, user, created: new Date() });
      await trip.save();
      res.status(200).json(trip);
    } else {
      res.status(500).json({ error: 'Unable to save trip' });
    }
  }
};
