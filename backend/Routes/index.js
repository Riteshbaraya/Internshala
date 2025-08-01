const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application=require("./application")
const user = require("./user");
const subscription = require("./subscription");
const payment = require("./payment");
const { router: authRouter } = require("./auth");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/user", user);
router.use("/subscription", subscription);
router.use("/payment", payment);
router.use("/auth", authRouter);

module.exports = router;
