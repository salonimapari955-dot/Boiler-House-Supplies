const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { productUpload } = require("../middleware/uploadMiddleware");
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  setFeaturedProducts,
} = require("../controllers/productController");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", authMiddleware, productUpload, addProduct);
// Keep this before `PUT /:id` so "featured" is not treated as a product id.
router.put("/featured", authMiddleware, setFeaturedProducts);
router.put("/:id", authMiddleware, productUpload, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
