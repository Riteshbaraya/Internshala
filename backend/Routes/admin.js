const express = require("express");
const router = express.Router();
const { authMiddleware } = require("./auth");
const User = require('../Model/User');

// Protected admin login route (requires JWT token)
router.post("/adminlogin", authMiddleware(['admin']), (req, res) => {
  res.status(200).json({ message: "Admin access granted" });
});

// Get admin dashboard data
router.get("/dashboard", authMiddleware(['admin']), (req, res) => {
  res.json({ 
    message: "Admin dashboard", 
    user: req.user,
    stats: {
      totalJobs: 0,
      totalApplications: 0,
      totalInternships: 0
    }
  });
});

// Get all users (for admin stats)
router.get('/user', authMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

module.exports = router;
