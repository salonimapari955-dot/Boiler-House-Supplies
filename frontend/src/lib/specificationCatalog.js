// Initial specification names used by the admin product form. The backend
// seeds the same catalog into MongoDB and returns any names added by an admin.
// Keeping this list locally means the dropdown still works while the API is
// loading or temporarily unavailable.
export const DEFAULT_SPECIFICATION_NAMES = [
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

// Merge catalog names from several sources without duplicating casing
// variants. The first occurrence wins.
export function mergeSpecificationNames(...sources) {
  const seen = new Set();
  const result = [];

  sources.flat().forEach((value) => {
    const name = typeof value === "string" ? value.trim() : "";

    if (!name) return;

    const key = name.toLowerCase();

    if (seen.has(key)) return;

    seen.add(key);
    result.push(name);
  });

  return result;
}
