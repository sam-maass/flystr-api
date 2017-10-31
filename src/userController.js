const UserModel = require('./userModel');

module.exports = {
  getOwnProfile: async (req, res, next) => {
    console.log(req.user);

    const profile = await UserModel.findById(req.user._id);
    res.status(200).json(profile);
  },

  logout: async (req, res, next) => {
    let profile = await UserModel.findById(req.user._id);
    profile.activeJWT = undefined;
    await profile.save();
    res.status(200).json();
  },

  login: async (req, res, next) => {
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

  signup: async (req, res, next) => {
    const exisitingUser = await UserModel.findOneAndUpdate({
      googleId: payload.sub
    });
    if (!exisitingUser) {
      user = new UserModel({ ...req.user, created: new Date() });
      user.save();
    }
    res.status(200).json(user);
  }
};
