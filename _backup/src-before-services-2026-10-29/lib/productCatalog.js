import { makeSlug, products as legacyProducts } from "../data/products.js";

/**
 * Product source adapter.
 *
 * The storefront is designed to read products from the admin/backend API.
 * The existing local catalogue in `src/data/products.js` is only used as a
 * fallback when no API is configured (or when the API is unreachable), so the
 * public site keeps working during the admin integration.
 *
 * Set these in `.env`:
 *   VITE_API_URL=https://your-admin-api.example.com
 *   VITE_PRODUCTS_PATH=/products            (optional, defaults to /products)
 *   VITE_PRODUCTS_URL=https://.../products  (optional full endpoint override)
 *   VITE_DISABLE_LOCAL_PRODUCTS=true        (optional, removes the fallback)
 */

const env = import.meta.env;

const API_BASE = (env.VITE_API_URL || env.VITE_PRODUCTS_API_URL || "").replace(
  /\/+$/,
  "",
);

const PRODUCTS_PATH = env.VITE_PRODUCTS_PATH || "/products";

const PRODUCTS_URL =
  env.VITE_PRODUCTS_URL ||
  (API_BASE ? `${API_BASE}${PRODUCTS_PATH}` : "");

const LOCAL_FALLBACK_ENABLED =
  env.VITE_DISABLE_LOCAL_PRODUCTS !== "true";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toImageUrl(value) {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (value && typeof value === "object") {
    const url = value.url || value.src || value.secure_url || value.path;
    if (typeof url === "string" && url.trim()) return url.trim();
  }

  return "";
}

function getImage(raw) {
  const directCandidates = [
    raw.image,
    raw.imageUrl,
    raw.thumbnail,
    raw.thumbnailUrl,
    raw.photo,
    raw.coverImage,
  ];

  for (const candidate of directCandidates) {
    const url = toImageUrl(candidate);
    if (url) return url;
  }

  const images = raw.images;
  if (Array.isArray(images)) {
    for (const image of images) {
      const url = toImageUrl(image);
      if (url) return url;
    }
  }

  return "";
}

function getCategory(raw) {
  if (raw.category && typeof raw.category === "object") {
    return cleanText(raw.category.name || raw.category.title);
  }
  return cleanText(raw.category) || cleanText(raw.categoryName);
}

function getItems(raw) {
  const source = raw.items || raw.features || raw.highlights;
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return cleanText(item.name || item.title || item.label);
      }
      return "";
    })
    .filter(Boolean);
}

function toBoolean(value) {
  if (typeof value === "string") {
    return ["true", "1", "yes", "featured"].includes(value.toLowerCase());
  }
  return value === true || value === 1;
}

function isFeatured(raw) {
  return toBoolean(
    raw.featured ??
      raw.isFeatured ??
      raw.featuredProduct ??
      raw.showOnHomepage,
  );
}

/**
 * Normalises the different product shapes an admin panel may return.
 */
export function normalizeProduct(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const name =
    cleanText(raw.name) ||
    cleanText(raw.title) ||
    cleanText(raw.productName);

  if (!name) return null;

  const slug = cleanText(raw.slug) || makeSlug(name);

  return {
    id: String(raw.id ?? raw._id ?? slug ?? index),
    slug,
    name,
    description:
      cleanText(raw.description) ||
      cleanText(raw.shortDescription) ||
      cleanText(raw.summary),
    image: getImage(raw),
    category: getCategory(raw),
    price: raw.price ?? raw.sellingPrice ?? raw.mrp ?? null,
    featured: isFeatured(raw),
    items: getItems(raw),
  };
}

function normalizeLegacyProduct(product) {
  return {
    id: makeSlug(product.name),
    slug: makeSlug(product.name),
    name: product.name,
    description: product.description || "",
    image: product.image || "",
    category: "",
    price: null,
    featured: false,
    items: Array.isArray(product.items) ? product.items : [],
  };
}

function getLocalProducts() {
  return legacyProducts.map(normalizeLegacyProduct);
}

function unwrapProductList(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.products,
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.products,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.docs,
    payload?.data?.records,
    payload?.data?.data,
    payload?.docs,
    payload?.records,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

/**
 * Loads products from the admin API when configured.
 * Falls back to the existing local catalogue only on a configuration or
 * network failure, never to invented data.
 */
export async function fetchProducts({ signal } = {}) {
  if (!PRODUCTS_URL) {
    const products = LOCAL_FALLBACK_ENABLED ? getLocalProducts() : [];
    return {
      products,
      source: products.length ? "local" : "none",
      warning: null,
    };
  }

  try {
    const response = await fetch(PRODUCTS_URL, {
      signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}.`);
    }

    const payload = await response.json();
    const products = unwrapProductList(payload)
      .map(normalizeProduct)
      .filter(Boolean);

    return { products, source: "api", warning: null };
  } catch (error) {
    if (error?.name === "AbortError") throw error;

    if (import.meta.env.DEV) {
      console.warn(
        "[products] Admin API unavailable; using the existing local catalogue.",
        error,
      );
    }

    const products = LOCAL_FALLBACK_ENABLED ? getLocalProducts() : [];

    return {
      products,
      source: products.length ? "local-fallback" : "none",
      warning: error?.message || "Unable to load products.",
    };
  }
}

/**
 * Homepage selection: featured products first, then the newest available
 * products, capped at three. This never creates product records.
 */
export function pickFeaturedProducts(products, limit = 3) {
  return [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, limit);
}

export function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "";

  if (typeof price === "string") {
    const trimmed = price.trim();
    if (!trimmed) return "";
    if (/[a-zA-Z₹$]/.test(trimmed)) return trimmed;

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return trimmed;
    price = parsed;
  }

  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export { makeSlug };
