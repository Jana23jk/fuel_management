// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/users', userRoutes);

// Reset Admin User
const resetAdminUser = async () => {
  try {
    await User.deleteOne({ username: 'admin1' });
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    await User.create({
      username: 'admin1',
      email: 'admin1@fuelmanagement.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('✅ Admin user reset successfully.');
  } catch (err) {
    console.error('❌ Error resetting admin user:', err);
  }
};

// Create Driver User
const createDriverUser = async () => {
  try {
    const existingDriver = await User.findOne({ username: 'driver1' });
    if (existingDriver) {
      console.log('⚠️ Driver already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('driver123', 10);
    await User.create({
      username: 'driver1',
      email: 'driver1@fuelmanagement.com',
      password: hashedPassword,
      role: 'driver',
      licenseNumber: 'CD1234567890'
    });
    console.log('✅ Driver user created successfully.');
  } catch (err) {
    console.error('❌ Error creating driver user:', err);
  }
};

// Mongo Connection and Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    await resetAdminUser();
    await createDriverUser();
  })
  .catch(err => console.error(err));
