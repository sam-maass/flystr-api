import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    activeJWT: String,
    googleId: String,
    firstName: String,
    lastName: String,
    googleProfile: Object,
    email: String,
    pwHash: String,
    created: Date,
    lastLogin: Date,
    isAdmin: Boolean
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
