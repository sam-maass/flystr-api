import UserModel from '../model/userModel';
import TripModel from '../model/tripModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendSignupEmail } from '../sendMail';
import _stripe from 'stripe';
import moment from 'moment';
const stripe = _stripe(process.env.STRIPE_SECRET_KEY);

const testPlanMap = {
  yearly: 'plan_DyT7Ja2b6b4wUA',
  quarterly: 'plan_DyT6OjnMgIHzf9',
  monthly: 'plan_DyT5LWQLfCugA3'
};

const livePlanMap = {
  yearly: 'plan_DzVjARlNHnHJ4S',
  quarterly: 'plan_DzVi8IX3omjtpA',
  monthly: 'plan_DzVib5ratv5bxu'
};

const planMap = process.env.STRIPE_SECRET_KEY.includes('live')
  ? livePlanMap
  : testPlanMap;

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
      await createSubscription(stripeCustomer, plan, user);
    } catch (error) {
      res.status(500).json({ error: error.message });
      await user
        .set({
          stripeCustomer: {}
        })
        .save();
      console.log({ error });
      return;
    }

    res.status(200).json(user);
  },

  cancelSubscription: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    let subscription_id;
    try {
      subscription_id = user.stripeSubscription.id;
    } catch (error) {
      res.status(500).json({ error: 'Found no subscription to cancel' });
      console.error('Cant cancel user subscription for user:', req.user._id);
      return;
    }
    const sub = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true
    });
    await user.set({ stripeSubscription: sub }).save();
    res.status(200).json(user);
    console.log(sub);
  },
  update: async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    user.set({ settings: req.body });
    await user.save();

    res.status(200).json(user);
  },

  getAdminOverview: async (req, res) => {
    const totalUsers = await UserModel.count();
    const oneMonthAgo = moment()
      .subtract(1, 'month')
      .toDate();
    const monthlyActiveUsers = await UserModel.find({
      updatedAt: { $gte: oneMonthAgo }
    }).count();
    const oneDayAgo = moment()
      .subtract(1, 'day')
      .toDate();
    const newUsers = await UserModel.find({
      createdAt: { $gte: oneDayAgo }
    }).count();
    const userList = await UserModel.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: 'user',
          as: 'trips'
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          createdAt: 1,
          updatedAt: 1,
          stripeSubscription: { id: 1 },
          tripCount: { $size: '$trips' }
        }
      }
    ]);

    return res.status(200).json({
      totalUsers,
      monthlyActiveUsers,
      newUsers,
      userList
    });
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
    const existingUser = await UserModel.findOne({
      googleId: req.user.googleId
    });
    if (existingUser) {
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
    const existingUser = await UserModel.findOne({
      email: req.body.email
    });
    if (existingUser) {
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

async function createSubscription(stripeCustomer, plan, user) {
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
}

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
      expiresIn: '5d',
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
