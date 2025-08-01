const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function debugAdminLogin() {
  await mongoose.connect(MONGO_URI);
  
  const username = 'admin';
  const password = 'ADMIN@123';
  
  console.log('🔍 Testing admin login with:', { username, password });
  
  // Find admin user
  const user = await User.findOne({
    $or: [
      { username: username },
      { email: username }
    ],
    role: 'admin'
  });
  
  if (!user) {
    console.log('❌ No admin user found');
    return;
  }
  
  console.log('✅ Admin user found:', {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
    passwordLength: user.password?.length
  });
  
  // Test password comparison
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('🔐 Password comparison result:', isMatch);
  
  if (isMatch) {
    console.log('✅ Password is correct!');
  } else {
    console.log('❌ Password is incorrect');
    
    // Test with a new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('🔄 New hash for comparison:', newHash.substring(0, 20) + '...');
    
    const newMatch = await bcrypt.compare(password, newHash);
    console.log('🔄 New hash comparison result:', newMatch);
  }
  
  process.exit(0);
}

debugAdminLogin().catch(console.error); 