// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'driver'],
    default: 'driver'
  },
  phone: {
    type: String,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'driver'; },
    trim: true,
    validate: {
      validator: function(v) {
        // Format: 2 letters followed by 10 numbers
        return /^[A-Z]{2}\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid license number! Must be 2 letters followed by 10 numbers (e.g., AB1234567890)`
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
