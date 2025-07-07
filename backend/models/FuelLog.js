const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  location: { 
    type: String, 
    required: true 
  },
  cost: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  odometerReading: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  notes: String,
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual for the creator's username
fuelLogSchema.virtual('creator', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
