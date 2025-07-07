// Reset Admin User
const resetAdminUser = async () => {
  try {
    await User.deleteOne({ username: 'admin1' });
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    await User.create({
      username: 'admin1',
      email: 'admin1@fuelmanagement.com',
      password: hashedPassword,
      role: 'admin',
      licenseNumber: 'AB1234567890' // <-- Add this line
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
      licenseNumber: 'CD1234567890' // <-- Add this line
    });
    console.log('✅ Driver user created successfully.');
  } catch (err) {
    console.error('❌ Error creating driver user:', err);
  }
};