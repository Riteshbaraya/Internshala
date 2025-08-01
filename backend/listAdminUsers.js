const mongoose = require('mongoose');
const User = require('./Model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function listAdmins() {
  await mongoose.connect(MONGO_URI);
  const admins = await User.find({ role: 'admin' });
  if (admins.length === 0) {
    console.log('No admin users found.');
  } else {
    console.log('Admin users:');
    admins.forEach(user => {
      console.log({ username: user.username, email: user.email, role: user.role });
    });
  }
  process.exit(0);
}

listAdmins();