const Specification = require("../models/Specification");

// The dropdown starts with these specification names. They are stored in
// MongoDB so names created by an admin live alongside the defaults and are
// available to every future product.
const DEFAULT_SPECIFICATION_NAMES = [
  "Material",
  "Part Type",
  "Bar Length",
  "Casting Material",
  "Bar Thickness",
  "Temperature Rating",
  "Grate Type",
  "Operating Boiler Type",
  "Boiler Type",
  "Product Type",
  "Color",
  "Usage/Application",
  "Surface Treatment",
  "Standard",
  "Packaging Type",
  "Warranty",
  "Country of Origin",
  "Size",
  "Load Class",
  "Thickness",
  "Grate Design",
  "Application",
  "Shape",
  "Surface Finish",
  "Fuel Type",
  "Diameter",
  "Packing",
  "Capacity",
  "Pressure",
  "Grate Width",
  "Capacity(kg/hr)",
  "Features",
  "Ash Handling",
  "Coating",
  "Condition",
  "Centre Distance",
  "Connection Size",
  "Design Pressure",
  "Type",
  "Brand",
  "Body Material",
  "Pressure Type",
  "Glass Material",
  "Drain Connection",
  "Service Type",
  "Scale Unit",
  "Gauge Valve",
  "Drain Option",
  "Vent Option",
  "Valve Size",
  "Usage",
  "IBR approval",
  "Door Size",
  "Door Type",
  "Opening style",
  "Phase",
  "Casting Grade",
  "Operation",
  "Mounting Style",
  "Finish",
  "Grade",
  "Packaging Size",
  "Max Service Temp",
  "Alumina Content",
  "Application Area",
  "Setting Type",
  "Form",
  "Bulk Density",
  "Shelf Life",
  "End Connection",
  "Max Operating Pressure",
  "Max Operating Temperature",
  "Flow Direction",
  "Cover Material",
  "Strainer",
  "Power",
  "Working Pressure",
  "Valve Type",
  "Design",
  "Material Grade",
  "Seat Material",
  "Installation Position",
  "Driving Mode",
];

let defaultsReady = false;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findByName(name) {
  return Specification.findOne({
    name: new RegExp(`^${escapeRegex(name)}$`, "i"),
  });
}

// Seed any missing default names once per server process. Existing names are
// left untouched so admin-created values and spelling are never overwritten.
async function ensureDefaults() {
  if (defaultsReady) return;

  const existing = await Specification.find({}, "name").lean();
  const known = new Set(
    existing
      .map((specification) => cleanText(specification.name).toLowerCase())
      .filter(Boolean),
  );

  const missing = DEFAULT_SPECIFICATION_NAMES.filter(
    (name) => !known.has(name.toLowerCase()),
  );

  if (missing.length) {
    try {
      await Specification.insertMany(
        missing.map((name) => ({ name })),
        { ordered: false }
      );
    } catch (error) {
      // A duplicate created by a concurrent request is safe to ignore.
      if (error.code !== 11000) throw error;
    }
  }

  defaultsReady = true;
}

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
      message: "Specification already exists",
    });
  }

  console.error("Specification controller error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

// List every available specification name (public).
const getSpecifications = async (req, res) => {
  try {
    await ensureDefaults();

    const specifications = await Specification.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: specifications.length,
      specifications,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Save a new specification name for future products (admin only).
const addSpecification = async (req, res) => {
  try {
    const name = cleanText(req.body.name);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Specification name is required",
      });
    }

    if (name.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Specification name must be 80 characters or fewer",
      });
    }

    // Reuse an existing name when only the casing differs so the dropdown
    // never ends up with duplicates such as "Material" and "material".
    const existing = await findByName(name);

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Specification already exists",
        specification: existing,
        existing: true,
      });
    }

    const specification = await Specification.create({ name });

    res.status(201).json({
      success: true,
      message: "Specification added successfully",
      specification,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  DEFAULT_SPECIFICATION_NAMES,
  getSpecifications,
  addSpecification,
};
