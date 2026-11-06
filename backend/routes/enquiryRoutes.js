const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  updateEnquiry,
  deleteEnquiry,
} = require("../controllers/enquiryController");

// Public route
router.post("/", createEnquiry);

// Admin routes
router.get("/", authMiddleware, getEnquiries);
router.get("/:id", authMiddleware, getEnquiryById);
router.put("/:id", authMiddleware, updateEnquiry);
router.patch("/:id/status", authMiddleware, updateEnquiryStatus);
router.delete("/:id", authMiddleware, deleteEnquiry);

module.exports = router;
