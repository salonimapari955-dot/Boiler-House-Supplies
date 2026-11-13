const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getSpecifications,
  addSpecification,
} = require("../controllers/specificationController");

// Public route
router.get("/", getSpecifications);

// Admin route
router.post("/", authMiddleware, addSpecification);

module.exports = router;
