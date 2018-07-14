const UserModel = require('../model/userModel');
const TripModel = require('../model/tripModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  loginWithEmail: async (req, res) => {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(500).json({ error: "Can't find user" });
    }
    console.log(req.body.password, user.pwHash);

    if (!bcrypt.compareSync(req.body.password, user.pwHash)) {
      res.status(500).json({ error: 'Invalid Password' });
    } else {
      user.activeJWT = jwt.sign(
        {
          email: req.body.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 15
        },
        process.env.JWT_SECRET
      );
      await user.save();
      res.status(200).json(user);
    }
  },

  login: async (req, res) => {
    const user = await UserModel.findOneAndUpdate({
      activeJWT: req.user.activeJWT
    });
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
      console.log(req.user);

      const user = new UserModel({ ...req.user, created: new Date() });
      user.save();
      res.status(200).json(user);
    }
  },

  signupWithEmail: async (req, res) => {
    const exisitingUser = await UserModel.findOne({
      email: req.body.email
    });
    if (exisitingUser) {
      res.status(500).json({ error: 'User already exists' });
    } else {
      const user = new UserModel({
        email: req.body.email,
        pwHash: await bcrypt.hash(req.body.password, 10),
        activeJWT: jwt.sign(
          {
            email: req.body.email,
            exp: Math.floor(Date.now() / 1000) + 60 * 15
          },
          process.env.JWT_SECRET
        ),
        created: new Date()
      });
      user.save();
      res.status(200).json(user);
    }
  }
};
