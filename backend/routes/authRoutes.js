// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('🟡 Attempting login for:', username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('🔴 User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🟢 Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with user ID and role
    const token = jwt.sign(
      { 
        id: user._id,  // Include the user's ID
        role: user.role 
      },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      role: user.role,
      userId: user._id  // Also send the user ID in the response
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
