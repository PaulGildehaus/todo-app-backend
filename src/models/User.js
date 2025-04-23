const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values for non-Google users
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure googleId is unique and allows null values
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true }); 

// Ensure email is unique
UserSchema.index({ email: 1 }, { unique: true }); 

module.exports = mongoose.model('User', UserSchema);