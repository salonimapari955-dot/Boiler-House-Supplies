const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const productImagesDir = path.join(uploadsRoot, "products");
const brochuresDir = path.join(uploadsRoot, "brochures");
const categoryImagesDir = path.join(uploadsRoot, "categories");

// Create the upload folders if they do not exist yet.
[productImagesDir, brochuresDir, categoryImagesDir].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "brochurePdf") {
      return cb(null, brochuresDir);
    }

    if (file.fieldname === "image") {
      return cb(null, categoryImagesDir);
    }

    return cb(null, productImagesDir);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40);

    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}-${baseName || "file"}${extension}`;

    cb(null, uniqueName);
  },
});

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function badFileError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function fileFilter(req, file, cb) {
  if (file.fieldname === "brochurePdf") {
    if (file.mimetype !== "application/pdf") {
      return cb(badFileError("Brochure must be a PDF file"));
    }

    return cb(null, true);
  }

  if (!imageTypes.includes(file.mimetype)) {
    return cb(
      badFileError("Only JPG, PNG, WEBP or GIF images are allowed")
    );
  }

  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 12, // 1 main image + up to 10 gallery images + 1 brochure
  },
});

const productUpload = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
  { name: "brochurePdf", maxCount: 1 },
]);

const categoryUpload = upload.single("image");

module.exports = { upload, productUpload, categoryUpload };
