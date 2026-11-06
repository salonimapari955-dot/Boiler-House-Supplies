const Product = require("../models/Product");
const Category = require("../models/Category");

// Convert an uploaded product image into a public URL path.
function imagePath(file) {
  return `/uploads/products/${file.filename}`;
}

// Convert an uploaded brochure into a public URL path.
function brochurePath(file) {
  return `/uploads/brochures/${file.filename}`;
}

// Accept gallery images as a JSON array, a comma separated string or an array.
function parseGalleryImages(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (error) {
      // Not JSON, so treat it as a comma separated list below.
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

// Accept YouTube URLs as a JSON array, a comma separated string, a newline
// separated string or an array.
function parseYoutubeVideos(value) {
  if (!value) return [];

  let videos = value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        videos = parsed;
      } else {
        videos = value.split(/[\n,]+/);
      }
    } catch (error) {
      videos = value.split(/[\n,]+/);
    }
  }

  if (!Array.isArray(videos)) return [];

  return videos
    .map((video) => {
      if (typeof video === "string") return video.trim();

      if (video && typeof video === "object") {
        return String(video.url || video.href || video.videoUrl || "").trim();
      }

      return "";
    })
    .filter(Boolean);
}

// Accept specifications as a JSON array of { name, value } objects.
function parseSpecifications(value) {
  if (!value) return [];

  let specs = value;

  if (typeof value === "string") {
    try {
      specs = JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  if (!Array.isArray(specs)) return [];

  return specs
    .filter((spec) => spec && spec.name && spec.value)
    .map((spec) => ({
      name: String(spec.name).trim(),
      value: String(spec.value).trim(),
    }));
}

// Keep unit values tidy and fall back to a sensible default.
function parseUnit(value, fallback = "Piece") {
  if (typeof value !== "string") return fallback;

  const unit = value.trim();
  return unit || fallback;
}

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Product controller error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

// Add a new product (admin only)
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      price,
      priceUnit,
      moq,
      moqUnit,
      description,
    } = req.body;

    const files = req.files || {};
    const mainImageFile = files.mainImage ? files.mainImage[0] : null;
    const galleryFiles = files.galleryImages || [];
    const brochureFile = files.brochurePdf ? files.brochurePdf[0] : null;

    const mainImage = mainImageFile
      ? imagePath(mainImageFile)
      : req.body.mainImage;

    const galleryImages = [
      ...parseGalleryImages(req.body.galleryImages),
      ...galleryFiles.map(imagePath),
    ];

    const brochurePdf = brochureFile
      ? brochurePath(brochureFile)
      : req.body.brochurePdf;

    if (!productName || !category || !mainImage || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, category, main image and description are required",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await Product.create({
      productName,
      category,
      mainImage,
      galleryImages,
      youtubeVideos: parseYoutubeVideos(req.body.youtubeVideos),
      price,
      priceUnit: parseUnit(priceUnit),
      moq,
      moqUnit: parseUnit(moqUnit),
      description,
      specifications: parseSpecifications(req.body.specifications),
      brochurePdf,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all products (public)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get one product by id (public)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a product (admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const body = req.body;
    const files = req.files || {};
    const mainImageFile = files.mainImage ? files.mainImage[0] : null;
    const galleryFiles = files.galleryImages || [];
    const brochureFile = files.brochurePdf ? files.brochurePdf[0] : null;

    if (body.productName !== undefined) {
      product.productName = body.productName;
    }

    if (body.category !== undefined) {
      const categoryExists = await Category.findById(body.category);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }

      product.category = body.category;
    }

    if (mainImageFile) {
      product.mainImage = imagePath(mainImageFile);
    } else if (body.mainImage !== undefined) {
      product.mainImage = body.mainImage;
    }

    if (galleryFiles.length > 0 || body.galleryImages !== undefined) {
      product.galleryImages = [
        ...parseGalleryImages(body.galleryImages),
        ...galleryFiles.map(imagePath),
      ];
    }

    if (body.youtubeVideos !== undefined) {
      product.youtubeVideos = parseYoutubeVideos(body.youtubeVideos);
    }

    if (body.price !== undefined && body.price !== "") {
      product.price = body.price;
    }

    if (body.priceUnit !== undefined) {
      product.priceUnit = parseUnit(body.priceUnit);
    }

    if (body.moq !== undefined && body.moq !== "") {
      product.moq = body.moq;
    }

    if (body.moqUnit !== undefined) {
      product.moqUnit = parseUnit(body.moqUnit);
    }

    if (body.description !== undefined) {
      product.description = body.description;
    }

    if (body.specifications !== undefined) {
      product.specifications = parseSpecifications(body.specifications);
    }

    if (brochureFile) {
      product.brochurePdf = brochurePath(brochureFile);
    } else if (body.brochurePdf !== undefined) {
      product.brochurePdf = body.brochurePdf;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Select the products shown in the home page Featured Products section.
// The selection is stored on the product records so the public product API
// already exposes it to the storefront.
const setFeaturedProducts = async (req, res) => {
  try {
    let rawIds =
      req.body.productIds ??
      req.body.featuredProductIds ??
      req.body.products;

    if (typeof rawIds === "string") {
      try {
        rawIds = JSON.parse(rawIds);
      } catch (error) {
        rawIds = rawIds.split(",");
      }
    }

    const ids = Array.isArray(rawIds)
      ? rawIds.map((id) => String(id).trim()).filter(Boolean)
      : [];
    const uniqueIds = [...new Set(ids)];
    const totalProducts = await Product.countDocuments();

    if (totalProducts === 0) {
      return res.status(400).json({
        success: false,
        message: "Add products before selecting featured products.",
      });
    }

    // The storefront is designed around three featured products. Smaller
    // catalogues feature every available product so the section never breaks.
    const requiredCount = Math.min(3, totalProducts);

    if (uniqueIds.length !== requiredCount) {
      return res.status(400).json({
        success: false,
        message:
          requiredCount === 3
            ? "Select exactly 3 featured products."
            : `Select all ${requiredCount} available products for the home page.`,
      });
    }

    const existingCount = await Product.countDocuments({
      _id: { $in: uniqueIds },
    });

    if (existingCount !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected products no longer exist.",
      });
    }

    await Product.updateMany(
      {},
      { $set: { featured: false, featuredOrder: null } },
    );

    await Product.bulkWrite(
      uniqueIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              featured: true,
              featuredOrder: index,
            },
          },
        },
      })),
    );

    const products = await Product.find({
      _id: { $in: uniqueIds },
    }).populate("category", "name");

    const order = new Map(uniqueIds.map((id, index) => [String(id), index]));

    products.sort(
      (a, b) => order.get(String(a._id)) - order.get(String(b._id)),
    );

    res.status(200).json({
      success: true,
      message: "Featured products updated successfully",
      products,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  setFeaturedProducts,
};
