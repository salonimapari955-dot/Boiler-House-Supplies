const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");

const allowedStatuses = ["new", "read", "in-progress", "resolved"];
const putStatuses = ["new", "contacted", "resolved"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Enquiry controller error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

// Submit an enquiry (public)
const createEnquiry = async (req, res) => {
  try {
    const body = req.body;

    // Support both the current website fields and the legacy field names.
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || body.mobile || "").trim();
    const message = (body.message || body.requirement || "").trim();

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and message are required",
      });
    }

    // Email is optional for product interest enquiries submitted with only a
    // mobile number, but it must still be valid whenever it is supplied.
    if (email && !emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (body.product && !mongoose.Types.ObjectId.isValid(body.product)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      company: body.company,
      product: body.product || undefined,
      message,
      source: body.source,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      enquiry,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all enquiries (admin only)
const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find()
      .populate("product", "productName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get one enquiry by id (admin only)
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate(
      "product",
      "productName"
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update an enquiry status (admin only)
const updateEnquiryStatus = async (req, res) => {
  try {
    const status = req.body.status;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    ).populate("product", "productName");

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully",
      enquiry,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update an enquiry by id (admin only)
const updateEnquiry = async (req, res) => {
  try {
    const { status } = req.body;

    if (!putStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${putStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry id",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    ).populate("product", "productName");

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      enquiry,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete an enquiry (admin only)
const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  updateEnquiry,
  deleteEnquiry,
};
