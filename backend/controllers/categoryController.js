const fs = require("fs");
const path = require("path");
const Category = require("../models/Category");
const Product = require("../models/Product");

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Category already exists",
    });
  }

  console.error("Category controller error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Category names are unique regardless of casing, so "Globe Valve" and
// "globe valve" cannot be created as two separate categories.
function findCategoryByName(name, excludeId) {
  const query = {
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Category.findOne(query);
}

function categoryImagePath(file) {
  return `/uploads/categories/${file.filename}`;
}

// Remove an uploaded category image from disk. Existing catalogue artwork that
// lives in the frontend public folder is intentionally left untouched.
function removeStoredImage(image) {
  if (typeof image !== "string" || !image.startsWith("/uploads/categories/")) {
    return;
  }

  const filePath = path.join(__dirname, "..", image.replace(/^\/+/, ""));

  fs.promises.unlink(filePath).catch(() => {
    // The file may already be gone; nothing else to do.
  });
}

function wantsImageRemoved(value) {
  return value === true || value === "true" || value === "1";
}

// Add a new category (admin only)
const addCategory = async (req, res) => {
  try {
    const name = cleanText(req.body.name);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await findCategoryByName(name);

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      description: cleanText(req.body.description),
      image: req.file ? categoryImagePath(req.file) : cleanText(req.body.image),
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all categories (public)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get one category by id (public)
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a category (admin only)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const name = cleanText(req.body.name);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const duplicate = await findCategoryByName(name, category._id);

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const previousImage = category.image;

    category.name = name;

    if (req.body.description !== undefined) {
      category.description = cleanText(req.body.description);
    }

    if (req.file) {
      category.image = categoryImagePath(req.file);
    } else if (wantsImageRemoved(req.body.removeImage)) {
      category.image = "";
    } else if (req.body.image !== undefined) {
      category.image = cleanText(req.body.image);
    }

    const updatedCategory = await category.save();

    if (previousImage && previousImage !== updatedCategory.image) {
      removeStoredImage(previousImage);
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a category (admin only). Products can be moved to another category in
// the same request so the delete never leaves products pointing at a missing
// category.
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const reassignTo = cleanText(
      req.body?.reassignTo || req.query?.reassignTo,
    );
    const productCount = await Product.countDocuments({
      category: category._id,
    });

    if (productCount > 0 && !reassignTo) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete this category because products are still assigned to it",
      });
    }

    let reassignedCount = 0;

    if (reassignTo) {
      const destination = await Category.findById(reassignTo);

      if (!destination) {
        return res.status(400).json({
          success: false,
          message: "The selected category could not be found",
        });
      }

      if (destination._id.equals(category._id)) {
        return res.status(400).json({
          success: false,
          message: "Choose a different category to move products to",
        });
      }

      if (productCount > 0) {
        const result = await Product.updateMany(
          { category: category._id },
          { category: destination._id },
        );

        reassignedCount = result.modifiedCount;
      }
    }

    const image = category.image;

    await category.deleteOne();
    removeStoredImage(image);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      reassignedCount,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Select the categories shown in the home page Featured Categories section.
// The selection is stored on the category records so the public category API
// already exposes it to the storefront.
const setFeaturedCategories = async (req, res) => {
  try {
    let rawIds =
      req.body.categoryIds ??
      req.body.featuredCategoryIds ??
      req.body.categories;

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
    const totalCategories = await Category.countDocuments();

    if (totalCategories === 0) {
      return res.status(400).json({
        success: false,
        message: "Add categories before selecting featured categories.",
      });
    }

    // The storefront is designed around three featured categories. Smaller
    // catalogues feature every available category so the section never breaks.
    const requiredCount = Math.min(3, totalCategories);

    if (uniqueIds.length !== requiredCount) {
      return res.status(400).json({
        success: false,
        message:
          requiredCount === 3
            ? "Select exactly 3 featured categories."
            : `Select all ${requiredCount} available categories for the home page.`,
      });
    }

    const existingCount = await Category.countDocuments({
      _id: { $in: uniqueIds },
    });

    if (existingCount !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected categories no longer exist.",
      });
    }

    await Category.updateMany(
      {},
      { $set: { featured: false, featuredOrder: null } },
    );

    await Category.bulkWrite(
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

    const categories = await Category.find({
      _id: { $in: uniqueIds },
    });

    const order = new Map(uniqueIds.map((id, index) => [String(id), index]));

    categories.sort(
      (a, b) => order.get(String(a._id)) - order.get(String(b._id)),
    );

    res.status(200).json({
      success: true,
      message: "Featured categories updated successfully",
      categories,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  setFeaturedCategories,
};
