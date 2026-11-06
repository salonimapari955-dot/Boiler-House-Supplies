const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    mainImage: {
      type: String,
      required: true,
      trim: true,
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    youtubeVideos: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      min: 0,
    },
    priceUnit: {
      type: String,
      trim: true,
      default: "Piece",
    },
    moq: {
      type: Number,
      min: 1,
    },
    moqUnit: {
      type: String,
      trim: true,
      default: "Piece",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
    brochurePdf: {
      type: String,
      trim: true,
    },
    // The admin panel selects up to three products for the home page. Keeping
    // the selection on the product records means the public product API already
    // returns everything the storefront needs.
    featured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
