// backend/routes/fuelRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const auth = require('../middlewares/authMiddleware');

// Create a new fuel log
router.post('/', auth(['admin', 'driver']), async (req, res) => {
  try {
    console.log('Received fuel log request:', req.body);
    console.log('User ID:', req.user.id);

    const { vehicleId, amount, date, location, cost, odometerReading, notes } = req.body;

    // Validate required fields
    if (!vehicleId || !amount || !date || !location || !cost || !odometerReading) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          vehicleId: !vehicleId ? 'Vehicle ID is required' : null,
          amount: !amount ? 'Amount is required' : null,
          date: !date ? 'Date is required' : null,
          location: !location ? 'Location is required' : null,
          cost: !cost ? 'Cost is required' : null,
          odometerReading: !odometerReading ? 'Odometer reading is required' : null
        }
      });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      console.log('Vehicle not found:', vehicleId);
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create the fuel log
    const fuelLog = new FuelLog({
      vehicle: vehicleId,
      amount: parseFloat(amount),
      date: new Date(date),
      location,
      cost: parseFloat(cost),
      odometerReading: parseFloat(odometerReading),
      notes: notes || '',
      createdBy: req.user.id
    });

    console.log('Creating fuel log:', fuelLog);

    // Save the fuel log
    const savedFuelLog = await fuelLog.save();
    console.log('Fuel log saved successfully:', savedFuelLog);

    // Populate the response with vehicle and creator details
    const populatedFuelLog = await FuelLog.findById(savedFuelLog._id)
      .populate('vehicle', 'vehicleNumber fuelType')
      .populate('createdBy', 'username');

    // Transform the response to include only the creator's username as creatorUsername
    const response = {
      ...populatedFuelLog.toObject(),
      creatorUsername: (populatedFuelLog.createdBy && typeof populatedFuelLog.createdBy === 'object')
        ? populatedFuelLog.createdBy.username
        : (typeof populatedFuelLog.createdBy === 'string' ? populatedFuelLog.createdBy : ''),
    };
    // Remove createdBy from the response to avoid confusion
    delete response.createdBy;

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating fuel log:', error);
    res.status(500).json({ 
      message: 'Error creating fuel log', 
      error: error.message,
      details: error.errors
    });
  }
});

// Get all fuel logs (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find()
      .populate('vehicle', 'vehicleNumber fuelType')
      .populate('createdBy', 'username')
      .sort({ date: -1 });

    // Transform the response to include only the creator's username as creatorUsername
    const transformedLogs = fuelLogs.map(log => {
      const obj = log.toObject();
      return {
        ...obj,
        creatorUsername: (log.createdBy && typeof log.createdBy === 'object')
          ? log.createdBy.username
          : (typeof log.createdBy === 'string' ? log.createdBy : ''),
        createdBy: undefined // Remove createdBy from the response
      };
    });

    res.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching fuel logs:', error);
    res.status(500).json({ message: 'Error fetching fuel logs', error: error.message });
  }
});

// Get fuel logs for a specific vehicle
router.get('/vehicle/:vehicleId', auth(['admin', 'driver']), async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find({ vehicle: req.params.vehicleId })
      .populate('vehicle', 'vehicleNumber fuelType')
      .populate('createdBy', 'username')
      .sort({ date: -1 });

    // Transform the response to include only the creator's username as creatorUsername
    const transformedLogs = fuelLogs.map(log => {
      const obj = log.toObject();
      return {
        ...obj,
        creatorUsername: (log.createdBy && typeof log.createdBy === 'object')
          ? log.createdBy.username
          : (typeof log.createdBy === 'string' ? log.createdBy : ''),
        createdBy: undefined // Remove createdBy from the response
      };
    });

    res.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching vehicle fuel logs:', error);
    res.status(500).json({ message: 'Error fetching vehicle fuel logs', error: error.message });
  }
});

// Get fuel logs for the current user (driver)
router.get('/my-logs', auth(['driver']), async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find({ createdBy: req.user.id })
      .populate('vehicle', 'vehicleNumber fuelType')
      .populate('createdBy', 'username')
      .sort({ date: -1 });

    // Transform the response to include only the creator's username as creatorUsername
    const transformedLogs = fuelLogs.map(log => {
      const obj = log.toObject();
      return {
        ...obj,
        creatorUsername: (log.createdBy && typeof log.createdBy === 'object')
          ? log.createdBy.username
          : (typeof log.createdBy === 'string' ? log.createdBy : ''),
        createdBy: undefined // Remove createdBy from the response
      };
    });

    res.json(transformedLogs);
  } catch (error) {
    console.error('Error fetching user fuel logs:', error);
    res.status(500).json({ message: 'Error fetching user fuel logs', error: error.message });
  }
});

// Update a fuel log
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { amount, date, location, cost, odometerReading, notes } = req.body;
    
    const fuelLog = await FuelLog.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        date,
        location,
        cost,
        odometerReading,
        notes
      },
      { new: true, runValidators: true }
    );

    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found' });
    }

    res.json(fuelLog);
  } catch (error) {
    console.error('Error updating fuel log:', error);
    res.status(500).json({ message: 'Error updating fuel log', error: error.message });
  }
});

// Delete a fuel log
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const fuelLog = await FuelLog.findByIdAndDelete(req.params.id);
    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found' });
    }
    res.json({ message: 'Fuel log deleted successfully' });
  } catch (error) {
    console.error('Error deleting fuel log:', error);
    res.status(500).json({ message: 'Error deleting fuel log', error: error.message });
  }
});

module.exports = router;
