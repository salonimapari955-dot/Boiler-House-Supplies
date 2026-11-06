import { useEffect, useState } from "react";
import api from "../../api.js";
import {
  normalizeCategory,
  normalizeProduct,
} from "../../lib/productCatalog.js";
import { getAdminToken } from "../auth.js";
import { AdminDataContext } from "./adminDataContext.js";

function authHeaders() {
  const token = getAdminToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function requestErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

/**
 * Shared admin data for categories and products.
 *
 * Categories and products are loaded from the same Express/MongoDB API used by
 * the rest of the admin panel. Category mutations update the local state
 * immediately after the API confirms them, so the website, product forms and
 * admin lists all read the same records on their next load.
 */
export function AdminDataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  function reload() {
    setLoading(true);
    setError("");
    setAttempt((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const categoriesRequest = api
      .get("/categories", { signal: controller.signal })
      .then((response) => {
        const list = Array.isArray(response.data.categories)
          ? response.data.categories
          : [];

        return list.map(normalizeCategory).filter(Boolean);
      });

    const productsRequest = api
      .get("/products", { signal: controller.signal })
      .then((response) => {
        const list = Array.isArray(response.data.products)
          ? response.data.products
          : [];

        return list.map(normalizeProduct).filter(Boolean);
      });

    Promise.allSettled([categoriesRequest, productsRequest]).then(
      ([categoriesResult, productsResult]) => {
        if (!active) return;

        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value);
        }

        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value);
        }

        const failure =
          categoriesResult.status === "rejected"
            ? categoriesResult.reason
            : productsResult.status === "rejected"
              ? productsResult.reason
              : null;

        setError(
          failure
            ? requestErrorMessage(
                failure,
                "Unable to load the admin catalogue. Make sure the backend is running.",
              )
            : "",
        );
        setLoading(false);
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  async function createCategory({ name, description = "", imageFile = null }) {
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post("/categories", formData, {
        headers: authHeaders(),
      });
      const category = normalizeCategory(response.data.category);

      if (!category) {
        throw new Error("The server did not return the new category.");
      }

      setCategories((current) =>
        [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
      );

      return { ok: true, category };
    } catch (requestError) {
      return {
        ok: false,
        error: requestErrorMessage(
          requestError,
          "Unable to create the category. Please try again.",
        ),
      };
    }
  }

  async function updateCategory(
    id,
    { name, description = "", imageFile = null, removeImage = false },
  ) {
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (removeImage) {
        formData.append("removeImage", "true");
      }

      const response = await api.put(`/categories/${id}`, formData, {
        headers: authHeaders(),
      });
      const category = normalizeCategory(response.data.category);

      if (!category) {
        throw new Error("The server did not return the updated category.");
      }

      setCategories((current) =>
        current
          .map((item) => (item.id === String(id) ? category : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      // Products store the category id, but their display name comes from the
      // category record. Keep the local copy in sync after a rename.
      setProducts((current) =>
        current.map((product) =>
          product.categoryId === String(id)
            ? { ...product, category: category.name }
            : product,
        ),
      );

      return { ok: true, category };
    } catch (requestError) {
      return {
        ok: false,
        error: requestErrorMessage(
          requestError,
          "Unable to update the category. Please try again.",
        ),
      };
    }
  }

  // Persist the admin's home page category selection. The API stores the order
  // on each category and clears the flag from every other category.
  async function saveFeaturedCategories(categoryIds) {
    try {
      const response = await api.put(
        "/categories/featured",
        { categoryIds },
        { headers: authHeaders() },
      );

      const list = Array.isArray(response.data.categories)
        ? response.data.categories
        : [];
      const orderById = new Map(
        list.map((category, index) => [
          String(category._id ?? category.id),
          index,
        ]),
      );

      setCategories((current) =>
        current.map((category) =>
          orderById.has(category.id)
            ? {
                ...category,
                featured: true,
                featuredOrder: orderById.get(category.id),
              }
            : { ...category, featured: false, featuredOrder: null },
        ),
      );

      return {
        ok: true,
        categories: list.map(normalizeCategory).filter(Boolean),
      };
    } catch (requestError) {
      return {
        ok: false,
        error: requestErrorMessage(
          requestError,
          "Unable to save the featured categories. Please try again.",
        ),
      };
    }
  }

  async function deleteCategory(id, reassignTo = null) {
    const target = categories.find((category) => category.id === String(id));

    if (!target) {
      return { ok: false, error: "This category no longer exists." };
    }

    const destination = reassignTo
      ? categories.find((category) => category.id === String(reassignTo))
      : null;

    try {
      const response = await api.delete(`/categories/${id}`, {
        headers: authHeaders(),
        data: reassignTo ? { reassignTo } : undefined,
      });

      setCategories((current) =>
        current.filter((category) => category.id !== String(id)),
      );

      if (destination) {
        setProducts((current) =>
          current.map((product) =>
            product.categoryId === String(id)
              ? {
                  ...product,
                  categoryId: destination.id,
                  category: destination.name,
                }
              : product,
          ),
        );
      }

      return {
        ok: true,
        reassigned: response.data.reassignedCount ?? 0,
      };
    } catch (requestError) {
      return {
        ok: false,
        error: requestErrorMessage(
          requestError,
          "Unable to delete the category. Please try again.",
        ),
      };
    }
  }

  return (
    <AdminDataContext.Provider
      value={{
        categories,
        products,
        loading,
        error,
        reload,
        createCategory,
        updateCategory,
        deleteCategory,
        saveFeaturedCategories,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}
