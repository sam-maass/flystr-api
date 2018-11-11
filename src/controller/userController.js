import UserModel from '../model/userModel';
import TripModel from '../model/tripModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendSignupEmail } from '../sendMail';

module.exports = {
  update: async (req, res) => {
    console.log(req.body);
    const user = await UserModel.findById(req.user._id);
    user.set({ settings: req.body });
    await user.save();
    console.log(user);

    res.status(200).json(user);
  },

  getProfile: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(501);
      return;
    }
    const trips = await TripModel.find({ user: req.user._id }).sort({
      createdAt: -1
    });
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
      returnError.unknownUser(res);
    } else if (!bcrypt.compareSync(req.body.password, user.pwHash)) {
      returnError.invalidPassword(res);
    } else {
      await updateJWT(user);
      res.status(200).json(user);
    }
  },

  login: async (req, res) => {
    const user = await UserModel.findOne({
      googleId: req.user.googleId
    });
    if (!user) {
      returnError.unknownUser(res);
    } else {
      await updateJWT(user);
      res.status(200).json(user);
    }
  },

  refreshToken: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      returnError.unknownUser(res);
    } else {
      await updateJWT(user);
      res.status(200).json(user);
    }
  },

  signup: async (req, res) => {
    const exisitingUser = await UserModel.findOne({
      googleId: req.user.googleId
    });
    if (exisitingUser) {
      returnError.duplicateUser(res);
    } else {
      const user = new UserModel({ ...req.user, created: new Date() });
      await updateJWT(user);
      user.save();
      sendSignupEmail(user.email);
      res.status(200).json(user);
    }
  },

  signupWithEmail: async (req, res) => {
    const exisitingUser = await UserModel.findOne({
      email: req.body.email
    });
    if (exisitingUser) {
      returnError.duplicateUser(res);
    } else {
      const user = new UserModel({
        email: req.body.email,
        pwHash: await bcrypt.hash(req.body.password, 10)
      });
      await updateJWT(user);
      user.save();
      sendSignupEmail(user.email);
      res.status(200).json(user);
    }
  }
};

async function updateJWT(user) {
  const { _id, isAdmin } = user;
  user.activeJWT = jwt.sign(
    { user: { _id, isAdmin } },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
      issuer: 'flystr'
    }
  );
  await user.save();
}

const returnError = {
  duplicateUser: res => res.status(500).json({ error: 'Email already in use' }),
  unknownUser: res =>
    res.status(500).json({ error: 'Email or Password incorrect' }),
  invalidPassword: res =>
    res.status(500).json({ error: 'Email or Password incorrect' })
};
