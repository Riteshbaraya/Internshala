const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function ensureAdminUser() {
  await mongoose.connect(MONGO_URI);
  
  // Check if admin user exists
  let adminUser = await User.findOne({ role: 'admin' });
  
  if (!adminUser) {
    // Create new admin user
    const hashedPassword = await bcrypt.hash('ADMIN@123', 10);
    adminUser = new User({
      name: 'Admin',
      username: 'admin',
      email: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Admin user created successfully');
  } else {
    // Update existing admin user to ensure proper fields
    const hashedPassword = await bcrypt.hash('ADMIN@123', 10);
    await User.updateOne(
      { _id: adminUser._id },
      { 
        $set: { 
          username: 'admin',
          email: 'admin',
          password: hashedPassword,
          name: 'Admin'
        } 
      }
    );
    console.log('✅ Admin user updated successfully');
  }
  
  // Verify the admin user
  const verifiedAdmin = await User.findOne({ role: 'admin' });
  console.log('🔍 Admin user details:', {
    username: verifiedAdmin.username,
    email: verifiedAdmin.email,
    role: verifiedAdmin.role,
    name: verifiedAdmin.name
  });
  
  process.exit(0);
}

ensureAdminUser().catch(console.error); 