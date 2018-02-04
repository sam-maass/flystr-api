const UserModel = require('../model/userModel');
const TripModel = require('../model/tripModel');

module.exports = {
  getOwnProfile: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    const trips = await TripModel.find({ user: req.user._id }).populate(
      'matchingDeals'
    );
    res.status(200).json({ user, trips });
  },

  logout: async (req, res) => {
    const profile = await UserModel.findById(req.user._id);
    profile.activeJWT = undefined;
    await profile.save();
    res.status(200).json();
  },

  login: async (req, res) => {
    const user = await UserModel.findOneAndUpdate(
      { googleId: req.user.googleId },
      { $set: { activeJWT: req.user.activeJWT } }
    );
    if (!user) {
      res.status(500).json({ error: "Can't find user" });
    } else {
      res.status(200).json(user);
    }
  },

  signup: async (req, res) => {
    const exisitingUser = await UserModel.findOne({
      googleId: req.user.googleId
    });
    if (exisitingUser) {
      res.status(500).json({ error: 'User already exists' });
    } else {
      const user = new UserModel({ ...req.user, created: new Date() });
      user.save();
      res.status(200).json(user);
    }
  }
};
