require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");

// The 16 categories used on the Boiler House Supplies website. The image paths
// point at the existing catalogue artwork in the frontend public folder, so
// seeding never replaces artwork that is already stored in MongoDB.
const categorySeed = [
  { name: "Globe Valve", image: "/products/categories/globe-valve.png" },
  { name: "Grate Bar", image: "/products/categories/grate-bar.jpg" },
  {
    name: "Boiler Mountings",
    image: "/products/categories/boiler-mountings.png",
  },
  { name: "Grate Boiler", image: "/products/categories/grate-boiler.png" },
  {
    name: "Boiler Fire Door",
    image: "/products/categories/boiler-fire-door.png",
  },
  {
    name: "Refractory Cement",
    image: "/products/categories/refractory-cement.jpg",
  },
  { name: "Steam Valves", image: "/products/categories/steam-valves.jpg" },
  { name: "Fire Grate", image: "/products/categories/fire-grate.jpg" },
  { name: "Boiler Parts", image: "/products/categories/boiler-parts.jpg" },
  { name: "Boiler Tubes", image: "/products/categories/boiler-tubes.jpg" },
  { name: "Down Valve", image: "/products/categories/down-valve.jpg" },
  {
    name: "Ceramic Fiber Blanket",
    image: "/products/categories/ceramic-fiber-blanket.jpg",
  },
  {
    name: "Boiler Castings",
    image: "/products/categories/boiler-castings.jpg",
  },
  { name: "Check Valve", image: "/products/categories/check-valve.jpg" },
  {
    name: "Magnetic Switches",
    image: "/products/categories/magnetic-switches.jpg",
  },
  {
    name: "Cleaning Brush",
    image: "/products/categories/cleaning-brush.jpeg",
  },
];

async function seedCategories() {
  try {
    await connectDB();

    console.log(`Seeding categories into database: ${mongoose.connection.name}`);

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const seed of categorySeed) {
      // Prevent duplicates, including the existing "Grate Bar" category.
      const existingCategory = await Category.findOne({ name: seed.name });

      if (existingCategory) {
        if (!existingCategory.image) {
          existingCategory.image = seed.image;
          await existingCategory.save();
          console.log(`Added missing image: ${seed.name}`);
          updated += 1;
        } else {
          console.log(`Skipped (already exists): ${seed.name}`);
          skipped += 1;
        }

        continue;
      }

      await Category.create(seed);
      console.log(`Added: ${seed.name}`);
      added += 1;
    }

    console.log("");
    console.log(`Total categories in list: ${categorySeed.length}`);
    console.log(`Added: ${added}`);
    console.log(`Images backfilled: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log("Category seeding completed.");
  } catch (error) {
    console.error("Category seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories();
