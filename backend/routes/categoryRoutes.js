const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { categoryUpload } = require("../middleware/uploadMiddleware");
const {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  setFeaturedCategories,
} = require("../controllers/categoryController");

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.post("/", authMiddleware, categoryUpload, addCategory);
// Keep this before `PUT /:id` so "featured" is not treated as a category id.
router.put("/featured", authMiddleware, setFeaturedCategories);
router.put("/:id", authMiddleware, categoryUpload, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;
