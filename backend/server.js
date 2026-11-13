const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const brochureAuthRoutes = require("./routes/brochureAuthRoutes");
const specificationRoutes = require("./routes/specificationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded product images and brochures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/brochure-auth", brochureAuthRoutes);
app.use("/api/specifications", specificationRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Boiler House Backend Running");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working properly",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler (Multer errors, invalid uploads and unexpected errors)
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 10 MB"
        : err.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  const status = err.status >= 400 && err.status < 500 ? err.status : 500;

  if (status === 500) {
    console.error("Unhandled error:", err.message);
  }

  return res.status(status).json({
    success: false,
    message: status === 500 ? "Server error" : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
