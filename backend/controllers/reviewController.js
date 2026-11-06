const mongoose = require("mongoose");
const Review = require("../models/Review");

const allowedStatuses = ["pending", "approved", "rejected"];

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Review controller error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Submit a customer review (public). New reviews always start as pending so
// they can be checked by an admin before they appear on the website.
const createReview = async (req, res) => {
  try {
    const body = req.body || {};

    // The public form posts `customerName`, but older/third-party clients may
    // still send `name`. Accept both and store the canonical field name.
    const rawCustomerName =
      typeof body.customerName === "string"
        ? body.customerName
        : typeof body.name === "string"
          ? body.name
          : "";
    const customerName = rawCustomerName.trim();
    const companyName =
      typeof body.companyName === "string" ? body.companyName.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const review = typeof body.review === "string" ? body.review.trim() : "";
    const rating = Number(body.rating);

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }

    if (!review) {
      return res.status(400).json({
        success: false,
        message: "Review message is required",
      });
    }

    const newReview = await Review.create({
      customerName,
      companyName,
      location,
      rating,
      review,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Thank you. Your review has been submitted and is awaiting approval.",
      review: newReview,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get approved reviews only (public, used by the Testimonials page)
const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get every review, newest first (admin only)
const getAllReviews = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
      }

      filter.status = req.query.status;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update a review's content and/or status (admin only). Sending only a status
// approves/rejects the review; sending content fields edits it in place.
const updateReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
    }

    const body = req.body || {};
    const updates = {};

    // Accept `name` as an alias for `customerName` on edits as well.
    const rawCustomerName =
      body.customerName !== undefined ? body.customerName : body.name;

    if (rawCustomerName !== undefined) {
      if (typeof rawCustomerName !== "string" || !rawCustomerName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required",
        });
      }

      updates.customerName = rawCustomerName.trim();
    }

    if (body.companyName !== undefined) {
      if (typeof body.companyName !== "string") {
        return res.status(400).json({
          success: false,
          message: "Company name must be text",
        });
      }

      updates.companyName = body.companyName.trim();
    }

    if (body.location !== undefined) {
      if (typeof body.location !== "string" || !body.location.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location is required",
        });
      }

      updates.location = body.location.trim();
    }

    if (body.rating !== undefined) {
      const rating = Number(body.rating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5",
        });
      }

      updates.rating = rating;
    }

    if (body.review !== undefined) {
      if (typeof body.review !== "string" || !body.review.trim()) {
        return res.status(400).json({
          success: false,
          message: "Review message is required",
        });
      }

      updates.review = body.review.trim();
    }

    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
      }

      updates.status = body.status;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one review field to update",
      });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: updates.status
        ? `Review ${updates.status} successfully`
        : "Review updated successfully",
      review,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Save or replace the admin reply shown beneath a review. This is separate
// from updateReview so approving/editing reviews keeps working unchanged.
const replyToReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
    }

    const body = req.body || {};
    const rawReply =
      body.adminReply !== undefined ? body.adminReply : body.reply;

    if (typeof rawReply !== "string" || !rawReply.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const adminReply = rawReply.trim();

    if (adminReply.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Reply cannot exceed 1000 characters",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        adminReply,
        adminRepliedAt: new Date(),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply saved successfully",
      review,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a review (admin only)
const deleteReview = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
    }

    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReview,
  replyToReview,
  deleteReview,
};
