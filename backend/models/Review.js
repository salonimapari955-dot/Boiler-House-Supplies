const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [120, "Customer name cannot exceed 120 characters"],
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [160, "Company name cannot exceed 160 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [160, "Location cannot exceed 160 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    review: {
      type: String,
      required: [true, "Review message is required"],
      trim: true,
      maxlength: [2000, "Review message cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminReply: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Reply cannot exceed 1000 characters"],
    },
    adminRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
