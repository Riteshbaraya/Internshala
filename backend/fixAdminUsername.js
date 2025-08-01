const mongoose = require('mongoose');
const User = require('./Model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function fixAdminUsername() {
  await mongoose.connect(MONGO_URI);
  const result = await User.updateMany(
    { role: 'admin' },
    { $set: { username: 'admin' } }
  );
  if (result.modifiedCount > 0) {
    console.log('Admin username set to "admin" for all admin users.');
  } else {
    console.log('No admin user updated.');
  }
  process.exit(0);
}

fixAdminUsername();