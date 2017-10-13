const UserModel = require('./userModel');

module.exports = {
  getOwnProfile: async (req, res, next) => {
    console.log(req.user);

    const profile = await UserModel.findById(req.user._id);
    res.status(200).json(profile);
  },

  newDeal: async (req, res, next) => {
    const newDeal = new UserModel(req.body);
    const deal = await newDeal.save();
    res.status(201).json(deal);
  }
};
