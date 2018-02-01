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
  lastLogin: Date
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
