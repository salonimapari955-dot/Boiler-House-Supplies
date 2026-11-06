const express = require("express");
const {
  sendOtp,
  resendOtp,
  verifyOtp,
} = require("../controllers/brochureOtpController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
