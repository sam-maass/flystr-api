const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  activeJWT: {
    id: String,
    exp: Number
  },
  googleId: String,
  firstName: String,
  lastName: String,
  googleProfile: Object,
  email: String,
  created: Date,
  lastLogin: Date,
  pushSubscription: {
    endpoint: String,
    expirationTime: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }
});

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
