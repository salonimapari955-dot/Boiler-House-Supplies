require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");

/**
 * Restores the original Boiler House Supplies catalogue.
 *
 * Source of truth: frontend/src/data/categories.js (16 categories, their
 * descriptions, image paths and product lists). The same artwork files are in
 * frontend/public/products/categories.
 *
 * This script only adds missing records and restores category metadata. It
 * never deletes or overwrites an existing product, so product details added in
 * the admin panel are preserved. The only category removed is the temporary
 * "test" category created during admin testing.
 */

const catalog = [
  {
    name: "Globe Valve",
    image: "/products/categories/globe-valve.png",
    description:
      "Offering you a complete choice of products which include cast steel non return valve and cast steel globe valve.",
    items: ["Cast Steel Non Return Valve", "Cast Steel Globe Valve"],
  },
  {
    name: "Grate Bar",
    image: "/products/categories/grate-bar.jpg",
    description:
      "Pioneers in the industry, we offer pulsating grate bar, cast iron dumping grate bar, cast iron triplex grate bar, cast iron round boiler grate bar jali, triplex grate bar and round grate bar jali from India.",
    items: [
      "Pulsating Grate Bar",
      "Cast Iron Dumping Grate Bar",
      "Cast Iron Triplex Grate Bar",
      "Cast Iron Round Boiler Grate Bar Jali",
      "Triplex Grate Bar",
      "Round Grate Bar Jali",
      "Cast Iron Grate Bars",
    ],
  },
  {
    name: "Boiler Mountings",
    image: "/products/categories/boiler-mountings.png",
    description:
      "Providing you the best range of bronze gauge glass valves, reflex level gauge, boiler safety valve, fusible plugs and boiler mobrey level controller with effective & timely delivery.",
    items: [
      "Bronze Gauge Glass Valves",
      "Reflex Level Gauge",
      "Boiler Safety Valve",
      "Fusible Plugs",
      "Boiler Mobrey Level Controller",
    ],
  },
  {
    name: "Grate Boiler",
    image: "/products/categories/grate-boiler.png",
    description:
      "Our range of products include cast iron travelling grate bar, isgec type travelling grate bars, travelling grate bar and reciprocating grate assembly.",
    items: [
      "Cast Iron Travelling Grate Bar",
      "ISGEC Type Travelling Grate Bars",
      "Travelling Grate Bar",
      "Reciprocating Grate Assembly",
    ],
  },
  {
    name: "Boiler Fire Door",
    image: "/products/categories/boiler-fire-door.png",
    description:
      "Our product range includes a wide range of boiler fire door, cast iron boiler fire door and cast iron boiler furnace door.",
    items: [
      "Boiler Fire Door",
      "Cast Iron Boiler Fire Door",
      "Cast Iron Boiler Furnace Door",
    ],
  },
  {
    name: "Refractory Cement",
    image: "/products/categories/refractory-cement.jpg",
    description:
      "Our product range includes a wide range of refractory castables cement and high alumina fire brick.",
    items: ["Refractory Castables Cement", "High Alumina Fire Brick"],
  },
  {
    name: "Steam Valves",
    image: "/products/categories/steam-valves.jpg",
    description:
      "We are a leading Retailer of ball float steam trap and thermodynamic steam trap from Ahilyanagar, India.",
    items: ["Ball Float Steam Trap", "Thermodynamic Steam Trap"],
  },
  {
    name: "Fire Grate",
    image: "/products/categories/fire-grate.jpg",
    description: "Our range of products include dumping grate boiler assembly.",
    items: ["Dumping Grate Boiler Assembly"],
  },
  {
    name: "Boiler Parts",
    image: "/products/categories/boiler-parts.jpg",
    description:
      "Prominent & Leading Retailer from Ahilyanagar, we offer stainless steel boiler nozzles.",
    items: ["Stainless Steel Boiler Nozzles"],
  },
  {
    name: "Boiler Tubes",
    image: "/products/categories/boiler-tubes.jpg",
    description:
      "Our product range includes a wide range of carbon steel seamless boiler tubes.",
    items: ["Carbon Steel Seamless Boiler Tubes"],
  },
  {
    name: "Down Valve",
    image: "/products/categories/down-valve.jpg",
    description:
      "Providing you the best range of cast steel blowdown valve with effective & timely delivery.",
    items: ["Cast Steel Blowdown Valve"],
  },
  {
    name: "Ceramic Fiber Blanket",
    image: "/products/categories/ceramic-fiber-blanket.jpg",
    description: "Leading Retailer of ceramic fiber blanket from Ahilyanagar.",
    items: ["Ceramic Fiber Blanket"],
  },
  {
    name: "Boiler Castings",
    image: "/products/categories/boiler-castings.jpg",
    description:
      "We are a leading Retailer of mixing boiler nozzle from Ahilyanagar, India.",
    items: ["Mixing Boiler Nozzle"],
  },
  {
    name: "Check Valve",
    image: "/products/categories/check-valve.jpg",
    description:
      "We are a leading Retailer of wafer check valve from Ahilyanagar, India.",
    items: ["Wafer Check Valve"],
  },
  {
    name: "Magnetic Switches",
    image: "/products/categories/magnetic-switches.jpg",
    description:
      "Prominent & Leading Retailer from Ahilyanagar, we offer mobrey magnetic switches.",
    items: ["Mobrey Magnetic Switches"],
  },
  {
    name: "Cleaning Brush",
    image: "/products/categories/cleaning-brush.jpeg",
    description: "Leading Retailer of boiler tube cleaning brush from Ahilyanagar.",
    items: ["Boiler Tube Cleaning Brush"],
  },
];

const publicRoot = path.join(__dirname, "..", "frontend", "public");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findByName(name) {
  return { name: new RegExp(`^${escapeRegExp(name)}$`, "i") };
}

async function restoreCatalog() {
  try {
    // Verify every original category image exists before touching the database.
    const missingImages = catalog.filter((entry) => {
      const file = path.join(publicRoot, entry.image.replace(/^\//, ""));
      return !fs.existsSync(file);
    });

    if (missingImages.length > 0) {
      throw new Error(
        `Missing category images: ${missingImages
          .map((entry) => entry.image)
          .join(", ")}`
      );
    }

    await connectDB();
    console.log(`Restoring catalogue in database: ${mongoose.connection.name}`);

    let categoriesAdded = 0;
    let categoriesUpdated = 0;
    let productsAdded = 0;
    let productsPreserved = 0;

    for (const entry of catalog) {
      let category = await Category.findOne(findByName(entry.name));

      if (!category) {
        category = await Category.create({
          name: entry.name,
          image: entry.image,
          description: entry.description,
        });
        categoriesAdded += 1;
        console.log(`Added category: ${entry.name}`);
      } else if (
        category.image !== entry.image ||
        category.description !== entry.description
      ) {
        category.image = entry.image;
        category.description = entry.description;
        await category.save();
        categoriesUpdated += 1;
        console.log(`Restored category details: ${entry.name}`);
      }

      for (const productName of entry.items) {
        const existing = await Product.findOne({
          productName: new RegExp(`^${escapeRegExp(productName)}$`, "i"),
        });

        if (existing) {
          productsPreserved += 1;
          continue;
        }

        await Product.create({
          productName,
          category: category._id,
          mainImage: entry.image,
          galleryImages: [],
          description: entry.description,
          priceUnit: "Piece",
          moqUnit: "Piece",
          specifications: [],
        });

        productsAdded += 1;
      }
    }

    // Remove the temporary test category only when no product references it.
    const testCategory = await Category.findOne({
      ...findByName("test"),
      description: /^test$/i,
      image: /^\/uploads\/categories\//,
    });

    let testCategoryRemoved = false;

    if (testCategory) {
      const linkedProducts = await Product.countDocuments({
        category: testCategory._id,
      });

      if (linkedProducts === 0) {
        await testCategory.deleteOne();
        testCategoryRemoved = true;
        console.log("Removed temporary test category.");
      } else {
        console.log(
          `Kept test category because ${linkedProducts} product(s) reference it.`
        );
      }
    }

    const categories = await Category.find().sort({ createdAt: 1 }).lean();
    const products = await Product.find().lean();

    console.log("");
    console.log(`Categories added: ${categoriesAdded}`);
    console.log(`Category details restored: ${categoriesUpdated}`);
    console.log(`Test category removed: ${testCategoryRemoved}`);
    console.log(`Products added: ${productsAdded}`);
    console.log(`Existing products preserved: ${productsPreserved}`);
    console.log(`Total categories: ${categories.length}`);
    console.log(`Total products: ${products.length}`);
    console.log("");

    for (const entry of catalog) {
      const category = categories.find(
        (item) => item.name.toLowerCase() === entry.name.toLowerCase()
      );
      const count = category
        ? products.filter(
            (product) =>
              String(product.category) === String(category._id)
          ).length
        : 0;

      console.log(`${entry.name}: ${count} product(s)`);
    }
  } catch (error) {
    console.error("Catalogue restore failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

restoreCatalog();
