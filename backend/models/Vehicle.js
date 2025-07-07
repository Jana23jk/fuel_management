const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Car', 'Truck', 'Bus', 'Van']
  },
  fuelType: { 
    type: String, 
    required: true, 
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric']
  },
  capacity: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  assignedDriver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
