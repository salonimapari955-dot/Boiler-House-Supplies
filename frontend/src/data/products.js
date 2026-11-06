
export const products = [
  {
    name: "Boiler Mountings",
    image: "/products/featured/boiler-mountings.png",
    description: "Boiler mounting products and accessories for industrial applications.",
    items: [
      "Bronze Gauge Glass Valves",
      "Reflex Level Gauge",
      "Boiler Safety Valve",
      "Fusible Plugs",
      "Boiler Mobrey Level Controller",
    ],
  },
  {
    name: "Grate Bar",
    image: "/products/featured/grate-bar.jpg",
    description: "Industrial boiler grate bars and cast iron grate components.",
    items: [
      "Pulsating Grate Bar",
      "Cast Iron Dumping Grate Bar",
      "Cast Iron Triplex Grate Bar",
      "Cast Iron Round Boiler Grate Bar Jali",
      "Triplex Grate Bar",
    ],
  },
  {
    name: "Grate Boiler",
    image: "/products/featured/grate-boiler.jpg",
    description: "Grate components and assemblies for industrial boilers.",
    items: [
      "Reciprocating Grate Assembly",
      "Cast Iron Travelling Grate Bar",
      "ISGEC Type Travelling Grate Bars",
      "Travelling Grate Bar",
    ],
  },
  {
    name: "Boiler Fire Door",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
    description: "Boiler furnace doors and cast iron fire door components.",
    items: [
      "Boiler Fire Door",
      "Cast Iron Boiler Furnace Door",
      "Cast Iron Boiler Fire Door",
    ],
  },

  {
    name: "Refractory Cement",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    description: "Refractory materials for high-temperature industrial applications.",
    items: [
      "Refractory Castables Cement",
      "High Alumina Fire Brick",
    ],
  },
  {
    name: "Steam Valves",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80",
    description: "Steam valve solutions for industrial boiler systems. Contact us to confirm available models.",
    items: [
      "Industrial Steam Valves (confirm actual models)",
    ],
  },
  {
    name: "Globe Valves",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=80",
    description: "Globe valves for industrial flow-control applications.",
    items: [
      "Cast Steel Globe Valve",
    ],
  },
  {
    name: "Fire Grate",
    image: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=900&q=80",
    description: "Fire grate assemblies and components for boiler furnaces.",
    items: [
      "Dumping Grate Boiler Assembly",
    ],
  },

  {
    name: "Boiler Parts",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=80",
    description: "Industrial boiler spare parts and components.",
    items: [
      "Stainless Steel Boiler Nozzles",
    ],
  },
  {
    name: "Boiler Tubes",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
    description: "Boiler tubes for industrial applications. Contact us to confirm specifications and availability.",
    items: [
      "Industrial Boiler Tubes (confirm actual product name)",
    ],
  },
  {
    name: "Down Valve",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80",
    description: "Boiler blowdown valves for industrial boiler systems.",
    items: [
      "Cast Steel Blowdown Valve",
    ],
  },
  {
    name: "Ceramic Fiber Blanket",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    description: "Thermal insulation materials for high-temperature industrial applications.",
    items: [
      "Ceramic Fiber Blanket",
    ],
  },
];

export function makeSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
