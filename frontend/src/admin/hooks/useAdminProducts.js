import { useCallback, useEffect, useState } from "react";
import api from "../../api.js";
import {
  normalizeProduct,
  sortProductsByCreatedAt,
} from "../../lib/productCatalog.js";
import { getAdminToken } from "../auth.js";

function apiOrigin() {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
}

// The API stores uploads as `/uploads/...`; keep that form when re-creating a
// product so the record does not depend on the current host name.
function storedImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const url = value.trim();
  const origin = apiOrigin();

  if (origin && url.startsWith(origin)) {
    return url.slice(origin.length);
  }

  return url;
}

function authHeaders() {
  const token = getAdminToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    api
      .get("/products", { signal: controller.signal })
      .then((response) => {
        if (!active) return;

        const rawProducts = Array.isArray(response.data.products)
          ? response.data.products
          : [];

        setProducts(
          sortProductsByCreatedAt(rawProducts).map(normalizeProduct).filter(Boolean),
        );
        setLoading(false);
      })
      .catch((requestError) => {
        if (
          !active ||
          requestError.code === "ERR_CANCELED" ||
          requestError.name === "CanceledError"
        ) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load products. Make sure the backend is running.",
        );
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  const remove = useCallback(async (id) => {
    await api.delete(`/products/${id}`, { headers: authHeaders() });
    setProducts((current) =>
      current.filter((product) => product.id !== String(id)),
    );
  }, []);

  const restore = useCallback(async (product) => {
    const formData = new FormData();

    formData.append("productName", product.name);
    formData.append("category", product.categoryId);
    formData.append("description", product.description || "");
    formData.append("mainImage", storedImageUrl(product.image));
    formData.append("priceUnit", product.priceUnit || "Piece");
    formData.append("moqUnit", product.moqUnit || "Piece");

    if (product.price !== null && product.price !== undefined) {
      formData.append("price", product.price);
    }

    if (product.moq !== null && product.moq !== undefined) {
      formData.append("moq", product.moq);
    }

    if (product.galleryImages?.length) {
      formData.append(
        "galleryImages",
        JSON.stringify(product.galleryImages.map(storedImageUrl)),
      );
    }

    if (product.brochurePdf) {
      formData.append("brochurePdf", storedImageUrl(product.brochurePdf));
    }

    if (product.youtubeVideos?.length) {
      formData.append(
        "youtubeVideos",
        JSON.stringify(product.youtubeVideos),
      );
    }

    if (product.specifications?.length) {
      formData.append("specifications", JSON.stringify(product.specifications));
    }

    const response = await api.post("/products", formData, {
      headers: authHeaders(),
    });

    const restored = normalizeProduct(response.data.product);

    if (restored) {
      // The catalogue is ordered oldest first, so a restored product belongs at
      // the bottom with the other newly created records.
      setProducts((current) => [...current, restored]);
    }

    return restored;
  }, []);

  return { products, loading, error, reload, remove, restore };
}
