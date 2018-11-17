import UserModel from '../model/userModel';
import TripModel from '../model/tripModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendSignupEmail } from '../sendMail';
import _stripe from 'stripe';
const stripe = _stripe(process.env.STRIPE_SECRET_KEY);

const planMap = {
  yearly: 'plan_DyT7Ja2b6b4wUA',
  quarterly: 'plan_DyT6OjnMgIHzf9',
  monthly: 'plan_DyT5LWQLfCugA3'
};

module.exports = {
  premiumSignup: async (req, res) => {
    const { _id: userId } = req.user;
    const { token, selectedPlan } = req.body;
    const plan = planMap[selectedPlan];
    const user = await UserModel.findById(userId);
    let { stripeCustomer = {} } = user;
    if (!stripeCustomer.id) {
      stripeCustomer = await createStripeCustomer(user, token, userId, res);
    }
    if (!stripeCustomer.id) return;
    try {
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [
          {
            plan
          }
        ]
      });
      if (stripeSubscription) {
        await user
          .set({
            stripeSubscription
          })
          .save();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
      await user
        .set({
          stripeCustomer: null
        })
        .save();
      console.log({ error });
      return;
    }

    res.status(200).json(user);
  },
  update: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    user.set({ settings: req.body });
    await user.save();

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

async function createStripeCustomer(user, token, userId, res) {
  try {
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      source: token.id,
      metadata: { userId }
    });
    await user.set({ stripeCustomer }).save();
    return stripeCustomer;
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log({ error });
  }
}

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
