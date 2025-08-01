const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Model/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your-db-name';

async function createAdmin() {
  await mongoose.connect(MONGO_URI);
  const username = 'admin';
  const email = 'admin';
  const password = 'ADMIN@123';

  let user = await User.findOne({ $or: [ { username }, { email } ], role: 'admin' });
  if (user) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  user = new User({
    name: 'Admin',
    username,
    email,
    password: hashed,
    role: 'admin'
  });
  await user.save();
  console.log('Admin user created with username and email "admin" and password "ADMIN@123"');
  process.exit(0);
}

createAdmin();