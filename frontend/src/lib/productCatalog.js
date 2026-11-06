import api from "../api.js";
import { categories as staticCategories } from "../data/categories.js";
import { makeSlug } from "../data/products.js";
import { getYouTubeVideoId } from "./youtube.js";

/**
 * Product source adapter.
 *
 * Products are loaded from the same Express API used by the admin panel.
 * Images returned as `/uploads/...` are served by the backend, so they are
 * expanded to the API origin instead of being requested from the frontend.
 */

const PRODUCTS_PATH = "/products";
const CATEGORIES_PATH = "/categories";

const API_ORIGIN = (() => {
  const baseURL = api.defaults.baseURL || "";

  try {
    return new URL(baseURL).origin;
  } catch {
    return "";
  }
})();

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toImageUrl(value) {
  let url = "";

  if (typeof value === "string" && value.trim()) {
    url = value.trim();
  } else if (value && typeof value === "object") {
    const nested = value.url || value.src || value.secure_url || value.path;
    url = typeof nested === "string" ? nested.trim() : "";
  }

  if (!url) return "";

  if (url.startsWith("/uploads/") && API_ORIGIN) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

function getImage(raw) {
  const directCandidates = [
    raw.mainImage,
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

  const images = raw.galleryImages || raw.images;
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

function getCategoryId(raw) {
  if (raw.category && typeof raw.category === "object") {
    return cleanText(String(raw.category._id ?? raw.category.id ?? ""));
  }

  return cleanText(String(raw.category ?? raw.categoryId ?? ""));
}

function getGalleryImages(raw) {
  const source = raw.galleryImages || raw.images;

  if (!Array.isArray(source)) return [];

  return source.map(toImageUrl).filter(Boolean);
}

function getYoutubeVideos(raw) {
  const source = raw.youtubeVideos || raw.youtubeUrls || raw.videos;

  if (!Array.isArray(source)) return [];

  const seen = new Set();

  return source
    .map((video) => {
      const value =
        typeof video === "string"
          ? video
          : video && typeof video === "object"
            ? video.url || video.href || video.videoUrl
            : "";

      return cleanText(value);
    })
    .filter((value) => {
      const videoId = getYouTubeVideoId(value);

      if (!videoId || seen.has(videoId)) return false;

      seen.add(videoId);
      return true;
    });
}

function getSpecifications(raw) {
  const source = raw.specifications || raw.specs;

  if (!Array.isArray(source)) return [];

  return source
    .map((specification) => {
      if (typeof specification === "string") {
        const value = specification.trim();
        return value ? { name: "", value } : null;
      }

      if (specification && typeof specification === "object") {
        const name = cleanText(
          specification.name || specification.label || specification.key,
        );
        const value = cleanText(
          specification.value || specification.text,
        );

        return name || value ? { name, value } : null;
      }

      return null;
    })
    .filter(Boolean);
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
    _id: raw._id ? String(raw._id) : undefined,
    slug,
    name,
    description:
      cleanText(raw.description) ||
      cleanText(raw.shortDescription) ||
      cleanText(raw.summary),
    image: getImage(raw),
    galleryImages: getGalleryImages(raw),
    youtubeVideos: getYoutubeVideos(raw),
    category: getCategory(raw),
    categoryId: getCategoryId(raw),
    price: raw.price ?? raw.sellingPrice ?? raw.mrp ?? null,
    priceUnit: cleanText(raw.priceUnit || raw.price_unit) || "Piece",
    moq: raw.moq ?? raw.minimumOrderQuantity ?? raw.minOrderQuantity ?? null,
    moqUnit: cleanText(raw.moqUnit || raw.moq_unit) || "Piece",
    specifications: getSpecifications(raw),
    brochurePdf: toImageUrl(raw.brochurePdf || raw.brochure),
    featured: isFeatured(raw),
    featuredOrder:
      raw.featuredOrder === null || raw.featuredOrder === undefined
        ? null
        : Number.isFinite(Number(raw.featuredOrder))
          ? Number(raw.featuredOrder)
          : null,
    items: getItems(raw),
  };
}

/**
 * Normalises a MongoDB category and keeps the existing catalogue artwork for
 * categories that already have a local presentation asset.
 */
export function normalizeCategory(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const name =
    cleanText(raw.name) ||
    cleanText(raw.title) ||
    cleanText(raw.categoryName);

  if (!name) return null;

  const slug = cleanText(raw.slug) || makeSlug(name);
  const fallback = staticCategories.find(
    (category) =>
      category.slug === slug ||
      category.name.toLowerCase() === name.toLowerCase(),
  );

  return {
    id: String(raw._id ?? raw.id ?? slug ?? index),
    _id: raw._id ? String(raw._id) : undefined,
    slug,
    name,
    description: cleanText(raw.description) || fallback?.description || "",
    image: toImageUrl(raw.image || raw.imageUrl) || fallback?.image || "",
    featured: isFeatured(raw),
    featuredOrder:
      raw.featuredOrder === null || raw.featuredOrder === undefined
        ? null
        : Number.isFinite(Number(raw.featuredOrder))
          ? Number(raw.featuredOrder)
          : null,
    items: Array.isArray(raw.items) ? raw.items : fallback?.items || [],
  };
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

function unwrapCategoryList(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.categories,
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.categories,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.docs,
    payload?.data?.records,
    payload?.docs,
    payload?.records,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

/**
 * Keeps products in oldest-to-newest order so newly added records always
 * appear at the bottom, matching the MongoDB query in the product controller.
 */
export function sortProductsByCreatedAt(products) {
  return [...products].sort((a, b) => {
    const aTime = Date.parse(a?.createdAt) || 0;
    const bTime = Date.parse(b?.createdAt) || 0;

    return aTime - bTime;
  });
}

/**
 * Loads products from the admin API.
 */
export async function fetchProducts({ signal } = {}) {
  try {
    const response = await api.get(PRODUCTS_PATH, { signal });
    const apiProducts = sortProductsByCreatedAt(
      unwrapProductList(response.data),
    )
      .map(normalizeProduct)
      .filter(Boolean);

    return {
      products: apiProducts,
      source: "api",
      warning: null,
    };
  } catch (error) {
    if (
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      error?.name === "AbortError"
    ) {
      throw error;
    }

    const message =
      error?.response?.data?.message ||
      "Unable to load the product catalogue. Please try again.";

    throw new Error(message, { cause: error });
  }
}

/**
 * Loads the MongoDB categories used by the storefront sidebar.
 */
export async function fetchCategories({ signal } = {}) {
  try {
    const response = await api.get(CATEGORIES_PATH, { signal });
    const categories = unwrapCategoryList(response.data)
      .map(normalizeCategory)
      .filter(Boolean);

    return { categories, source: "api", warning: null };
  } catch (error) {
    if (
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      error?.name === "AbortError"
    ) {
      throw error;
    }

    const message =
      error?.response?.data?.message ||
      "Unable to load product categories. Please try again.";

    throw new Error(message, { cause: error });
  }
}

/**
 * Matches a product to a category using the MongoDB id first, then the
 * category name/slug for older records.
 */
export function productMatchesCategory(product, category) {
  if (!product || !category) return false;

  const productCategoryId = cleanText(String(product.categoryId ?? ""));
  const categoryId = cleanText(String(category._id ?? category.id ?? ""));

  if (productCategoryId && categoryId && productCategoryId === categoryId) {
    return true;
  }

  const productCategory = cleanText(product.category);

  if (!productCategory) return false;

  return (
    productCategory.toLowerCase() === category.name.toLowerCase() ||
    makeSlug(productCategory) === category.slug
  );
}

/**
 * Counts products per category from the API product list. No counts are
 * hardcoded, so the sidebar always reflects MongoDB.
 */
export function countProductsByCategory(products, categories) {
  const counts = {};

  categories.forEach((category) => {
    counts[category.slug] = 0;
  });

  products.forEach((product) => {
    const category = categories.find((item) =>
      productMatchesCategory(product, item),
    );

    if (category) {
      counts[category.slug] += 1;
    }
  });

  return counts;
}

/**
 * Homepage selection: only categories explicitly featured in the admin panel,
 * in the order the admin selected them, capped at three.
 */
export function pickFeaturedCategories(categories, limit = 3) {
  return [...categories]
    .filter((category) => category.featured)
    .sort((a, b) => {
      if (a.featuredOrder === null && b.featuredOrder === null) return 0;
      if (a.featuredOrder === null) return 1;
      if (b.featuredOrder === null) return -1;
      return a.featuredOrder - b.featuredOrder;
    })
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

export function getUnit(value, fallback = "Piece") {
  const unit = cleanText(value);
  return unit || fallback;
}

export function formatPriceWithUnit(product) {
  const price = formatPrice(product?.price);

  if (!price) return "";

  const unit = getUnit(product?.priceUnit);
  return `${price} / ${unit}`;
}

export { makeSlug };
