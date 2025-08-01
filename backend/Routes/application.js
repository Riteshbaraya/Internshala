const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const { authMiddleware } = require("./auth");
const sendApplicationEmail = require('../sendApplicationEmail');

// Get applications for a specific user (no admin auth required)
router.get("/user/:userIdentifier", async (req, res) => {
  try {
    const { userIdentifier } = req.params;
    const decodedIdentifier = decodeURIComponent(userIdentifier);
    console.log("Searching for applications with user identifier:", decodedIdentifier);
    
    // Search by both email and uid
    const data = await application.find({
      $or: [
        { "user.email": decodedIdentifier },
        { "user.uid": decodedIdentifier }
      ]
    });
    
    console.log("Found applications:", data);
    
    res.status(200).json(data);
  } catch (error) {
    console.log("Error in user applications route:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Protected routes - require admin authentication
router.get("/", authMiddleware(['admin']), async (req, res) => {
  try {
    const data = await application.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});

router.get("/:id", authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "application not found" });
    }
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});

router.put("/:id", authMiddleware(['admin']), async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(404).json({ error: "Invalid action" });
    return;
  }
  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }

    // Get the job/internship title for notification
    let jobTitle = "Application";
    try {
      if (updateapplication.Application) {
        // Try to get job title from job collection
        const Job = require("../Model/Job");
        const job = await Job.findById(updateapplication.Application);
        if (job) {
          jobTitle = job.title;
        } else {
          // Try to get internship title from internship collection
          const Internship = require("../Model/Internship");
          const internship = await Internship.findById(updateapplication.Application);
          if (internship) {
            jobTitle = internship.title;
          }
        }
      }
    } catch (error) {
      console.log("Error fetching job/internship title:", error);
    }

    // EMIT SOCKET EVENT FOR REAL-TIME NOTIFICATION
    const io = req.app.get("io");
    console.log("🔔 Application status changed - attempting to emit socket event");
    console.log("  - io exists:", !!io);
    console.log("  - user exists:", !!updateapplication.user);
    console.log("  - user.email exists:", !!(updateapplication.user && updateapplication.user.email));
    
    if (io && updateapplication.user && updateapplication.user.email) {
      const userEmail = updateapplication.user.email;
      
      console.log("🔔 Emitting socket event to user:", userEmail);
      console.log("🔔 Event data:", {
        email: userEmail,
        status: status,
        title: jobTitle,
        applicationId: updateapplication._id
      });
      
      io.to(userEmail).emit('application-status-changed', {
        email: userEmail,
        status: status, // 'accepted' or 'rejected'
        title: jobTitle,
        applicationId: updateapplication._id
      });
      
      console.log("✅ Socket event emitted successfully");
    } else {
      console.error("❌ Socket.io instance not found or user.email missing");
      console.error("io exists:", !!io);
      console.error("user exists:", !!updateapplication.user);
      console.error("user.email exists:", !!(updateapplication.user && updateapplication.user.email));
    }

    // Include notification data in response
    const responseData = {
      success: true,
      data: updateapplication,
      notification: {
        shouldNotify: true,
        type: status,
        title: jobTitle,
        company: updateapplication.company,
        userEmail: updateapplication.user.email,
        userUid: updateapplication.user.uid
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

// Public route for submitting applications (users can submit without admin auth)
router.post("/", async (req, res) => {
  try {
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check subscription limits
    const Subscription = require("../Model/Subscription");
    const subscription = await Subscription.findOne({ 
      userId: decoded.id, 
      isActive: true 
    }).sort({ startedAt: -1 });

    const plans = require("../config/plans");
    let canApply = true;
    let applicationsLeft = 1; // Default for free plan

    if (subscription) {
      const plan = plans[subscription.planName];
      applicationsLeft = plan.limit === Infinity ? 
        Infinity : 
        plan.limit - subscription.applicationsUsed;
      canApply = applicationsLeft > 0;
    }

    if (!canApply) {
      return res.status(403).json({ 
        message: 'Application limit reached. Please upgrade your plan.',
        applicationsLeft: 0
      });
    }

    const applicationipdata = new application({
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      user: req.body.user,
      Application: req.body.Application,
      body: req.body.body,
    });
    
    const data = await applicationipdata.save();

    // Increment application count
    if (subscription) {
      subscription.applicationsUsed += 1;
      await subscription.save();
    } else {
      // Create free plan subscription record
      const newSubscription = new Subscription({
        userId: decoded.id,
        planName: 'free',
        applicationsUsed: 1,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      });
      await newSubscription.save();
    }

    // Send confirmation email (fire and forget)
    try {
      const userEmail = data.user.email;
      const userName = data.user.name;
      const jobTitle = req.body.jobTitle || req.body.category || 'Job/Internship';
      const companyName = data.company;
      const appliedDate = data.createdAt || new Date();
      const sendApplicationEmail = require('../sendApplicationEmail');
      sendApplicationEmail(userEmail, userName, jobTitle, companyName, appliedDate);
    } catch (e) {
      console.error('Error calling sendApplicationEmail:', e);
    }

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public route to get the latest application status for a user (for notification polling)
router.get("/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Find the latest application for the user (by user.uid or user.email)
    const latestApp = await application.findOne({
      $or: [
        { "user.uid": userId },
        { "user.email": userId }
      ]
    }).sort({ updatedAt: -1 });
    if (!latestApp) return res.json({ status: null });
    res.json({ status: latestApp.status });
  } catch (error) {
    res.status(500).json({ status: null, error: error.message });
  }
});

module.exports = router;
