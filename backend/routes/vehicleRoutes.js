const express = require('express');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// Create - Add a new vehicle
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { vehicleNumber, type, fuelType, capacity, assignedDriver } = req.body;
    
    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }

    // If assignedDriver is provided, verify it exists and is a driver
    if (assignedDriver) {
      const driver = await User.findOne({ _id: assignedDriver, role: 'driver' });
      if (!driver) {
        return res.status(400).json({ message: 'Invalid driver ID or user is not a driver' });
      }
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      type,
      fuelType,
      capacity,
      assignedDriver: assignedDriver || null
    });
    
    const populatedVehicle = await Vehicle.findById(vehicle._id).populate('assignedDriver', 'username');
    res.status(201).json(populatedVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Error creating vehicle', error: error.message });
  }
});

// Read - Get all vehicles
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDriver', 'username');
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
  }
});

// Read - Get vehicles assigned to current driver
router.get('/assigned', auth(['driver']), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ assignedDriver: req.user.id });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching assigned vehicles:', error);
    res.status(500).json({ message: 'Error fetching assigned vehicles', error: error.message });
  }
});

// Read - Get single vehicle
router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('assignedDriver', 'username');
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Error fetching vehicle', error: error.message });
  }
});

// Update - Update a vehicle
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { vehicleNumber, type, fuelType, capacity, assignedDriver } = req.body;
    
    // Check if vehicle number already exists (excluding current vehicle)
    const existingVehicle = await Vehicle.findOne({ 
      vehicleNumber, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }

    // If assignedDriver is provided, verify it exists and is a driver
    if (assignedDriver) {
      const driver = await User.findOne({ _id: assignedDriver, role: 'driver' });
      if (!driver) {
        return res.status(400).json({ message: 'Invalid driver ID or user is not a driver' });
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        vehicleNumber,
        type,
        fuelType,
        capacity,
        assignedDriver: assignedDriver || null
      },
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'username');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Error updating vehicle', error: error.message });
  }
});

// Delete - Delete a vehicle
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Error deleting vehicle', error: error.message });
  }
});

module.exports = router;
