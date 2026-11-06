const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReview,
  replyToReview,
  deleteReview,
} = require("../controllers/reviewController");

// Public routes
router.post("/", createReview);
router.get("/", getApprovedReviews);

// Admin routes. Keep /admin before any /:id route so it is not treated as an id.
router.get("/admin", authMiddleware, getAllReviews);
router.put("/:id/reply", authMiddleware, replyToReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;
