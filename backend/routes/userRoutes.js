const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');

// Create a new driver (admin only)
router.post('/driver', auth(['admin']), async (req, res) => {
  try {
    const { username, email, password, phone, licenseNumber } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new driver
    const driver = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'driver',
      phone,
      licenseNumber,
      isActive: true
    });

    // Remove password from response
    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.status(201).json(driverResponse);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Error creating driver', error: error.message });
  }
});

// Get all users (admin only)
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get single user (admin only)
router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user (admin only)
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const { username, email, password, phone, licenseNumber, isActive } = req.body;
    const updateData = { username, email, phone, licenseNumber, isActive };

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: req.params.id }
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router; 