import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  StarIcon,
} from "../../components/Icons.jsx";
import { productMatchesCategory } from "../../lib/productCatalog.js";
import { clearAdminToken } from "../auth.js";
import { useAdminData } from "../context/useAdminData.js";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function GridIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TagIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M3.5 11.6V4.5a1 1 0 0 1 1-1h7.1a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3.5" />
      <path d="M14 8.5 17.5 12 14 15.5" />
      <path d="M8 12h9.5" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m13.5 6.5 3 3" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
      <path d="M10.5 10v6.5M13.5 10v6.5" />
    </svg>
  );
}

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: GridIcon },
  { label: "Add Product", to: "/admin/add-product", icon: PlusIcon },
  {
    label: "Manage Products",
    to: "/admin/manage-products",
    icon: PackageIcon,
  },
  { label: "Categories", to: "/admin/categories", icon: TagIcon },
  { label: "Enquiries", to: "/admin/enquiries", icon: MailIcon },
  { label: "Testimonials", to: "/admin/testimonials", icon: StarIcon },
];

const emptyValues = { name: "", description: "" };

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FEATURED_CATEGORIES = 3;

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function ManageCategories() {
  const navigate = useNavigate();
  const {
    categories,
    products,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    saveFeaturedCategories,
  } = useAdminData();

  const imageInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [values, setValues] = useState(emptyValues);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [reassignTo, setReassignTo] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [featuredDraft, setFeaturedDraft] = useState(null);
  const [featuredSaving, setFeaturedSaving] = useState(false);
  const [featuredStatus, setFeaturedStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      setSidebarOpen(false);
      setPendingDelete(null);
      setReassignTo("");
      setDeleteError("");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleLogout() {
    clearAdminToken();
    closeSidebar();
    navigate("/", { replace: true });
  }

  const productCounts = useMemo(() => {
    const counts = {};

    categories.forEach((category) => {
      counts[category.id] = products.filter((product) =>
        productMatchesCategory(product, category),
      ).length;
    });

    return counts;
  }, [categories, products]);

  const searchTerm = query.trim().toLowerCase();

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.description ?? ""}`
      .toLowerCase()
      .includes(searchTerm),
  );

  const maxFeatured = Math.min(MAX_FEATURED_CATEGORIES, categories.length);

  const savedFeaturedIds = useMemo(
    () =>
      categories
        .filter((category) => category.featured)
        .sort((a, b) => {
          if (a.featuredOrder === null && b.featuredOrder === null) return 0;
          if (a.featuredOrder === null) return 1;
          if (b.featuredOrder === null) return -1;
          return a.featuredOrder - b.featuredOrder;
        })
        .slice(0, MAX_FEATURED_CATEGORIES)
        .map((category) => category.id),
    [categories],
  );

  // Checkbox changes stay in a draft until Save Selection is clicked. A null
  // draft means "show whatever is currently saved in the database".
  const featuredIds = useMemo(() => {
    const source = featuredDraft ?? savedFeaturedIds;
    const availableIds = new Set(categories.map((category) => category.id));

    return source.filter((id) => availableIds.has(id));
  }, [featuredDraft, savedFeaturedIds, categories]);

  const featuredReady = maxFeatured > 0 && featuredIds.length === maxFeatured;

  function toggleFeaturedCategory(categoryId) {
    setFeaturedStatus({ type: "", message: "" });
    setFeaturedDraft((current) => {
      const selection = current ?? savedFeaturedIds;

      if (selection.includes(categoryId)) {
        return selection.filter((id) => id !== categoryId);
      }

      if (selection.length >= maxFeatured) return selection;

      return [...selection, categoryId];
    });
  }

  async function handleSaveFeatured() {
    if (!featuredReady || featuredSaving) return;

    setFeaturedSaving(true);
    setFeaturedStatus({ type: "", message: "" });

    const result = await saveFeaturedCategories(featuredIds);

    setFeaturedSaving(false);

    if (!result.ok) {
      setFeaturedStatus({ type: "error", message: result.error });
      return;
    }

    setFeaturedDraft(null);
    setFeaturedStatus({
      type: "success",
      message: "Home page featured categories updated successfully.",
    });
  }

  const pendingCount = pendingDelete
    ? productCounts[pendingDelete.id] ?? 0
    : 0;

  const reassignOptions = pendingDelete
    ? categories.filter((category) => category.id !== pendingDelete.id)
    : [];

  function clearPreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  }

  function resetForm() {
    setEditingId(null);
    setValues(emptyValues);
    setErrors({});
    setFormError("");
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(false);
    clearPreviewUrl();

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function focusForm() {
    document
      .getElementById("category-form")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document
      .getElementById("category-name")
      ?.focus({ preventScroll: true });
  }

  function startNewCategory() {
    resetForm();
    setStatus("");
    focusForm();
  }

  function startEdit(category) {
    clearPreviewUrl();

    setEditingId(category.id);
    setValues({
      name: category.name,
      description: category.description ?? "",
    });
    setImageFile(null);
    setImagePreview(category.image ?? "");
    setRemoveImage(false);
    setErrors({});
    setFormError("");
    setStatus("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    focusForm();
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setStatus("");
    setFormError("");

    setErrors((current) => {
      if (!current[name]) return current;
      return { ...current, [name]: "" };
    });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        image: "Choose a JPG, PNG, WEBP or GIF image.",
      }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((current) => ({
        ...current,
        image: "Choose an image smaller than 5 MB.",
      }));
      return;
    }

    clearPreviewUrl();

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreview(previewUrl);
    setRemoveImage(false);
    setFormError("");
    setStatus("");
    setErrors((current) => ({ ...current, image: "" }));
  }

  function handleRemoveImage() {
    clearPreviewUrl();
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
    setFormError("");
    setStatus("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    const name = values.name.trim();
    const description = values.description.trim();
    const next = {};

    if (!name) {
      next.name = "Enter a category name.";
    } else if (name.length < 2) {
      next.name = "Use at least 2 characters.";
    } else if (
      categories.some(
        (category) =>
          category.id !== editingId &&
          category.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      next.name = "A category with this name already exists.";
    }

    setErrors(next);
    setFormError("");

    if (next.name) {
      document.getElementById("category-name")?.focus();
      return;
    }

    setSubmitting(true);

    const result = editingId
      ? await updateCategory(editingId, {
          name,
          description,
          imageFile,
          removeImage,
        })
      : await createCategory({ name, description, imageFile });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setStatus(
      editingId
        ? `"${name}" was updated.`
        : `"${name}" was added to the catalogue.`,
    );
    resetForm();
  }

  function openDelete(category) {
    setPendingDelete(category);
    setReassignTo("");
    setDeleteError("");
  }

  function closeDelete() {
    setPendingDelete(null);
    setReassignTo("");
    setDeleteError("");
    setDeleting(false);
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;

    const category = pendingDelete;
    const count = productCounts[category.id] ?? 0;
    const destination = categories.find(
      (item) => item.id === reassignTo,
    );

    setDeleting(true);
    const result = await deleteCategory(
      category.id,
      count ? reassignTo : null,
    );
    setDeleting(false);

    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }

    setStatus(
      count
        ? `"${category.name}" was deleted and ${count} product${
            count === 1 ? "" : "s"
          } moved to "${destination?.name ?? "the selected category"}".`
        : `"${category.name}" was deleted.`,
    );

    if (editingId === category.id) {
      resetForm();
    }

    closeDelete();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 font-sans text-slate-600 selection:bg-slate-900 selection:text-white [&_a:focus-visible]:outline-slate-900 [&_button:focus-visible]:outline-slate-900">
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl"
        aria-hidden="true"
      />

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div className="relative flex min-h-screen">
        <aside
          id="admin-sidebar"
          aria-label="Admin navigation"
          className={`fixed top-0 left-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-xl shadow-slate-300/30 transition-transform duration-300 lg:w-64 lg:max-w-none lg:translate-x-0 ${
            sidebarOpen
              ? "visible translate-x-0"
              : "invisible -translate-x-full lg:visible"
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <Link
              to="/admin/dashboard"
              onClick={closeSidebar}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-semibold text-white shadow-md shadow-slate-900/20">
                BH
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight text-slate-900">
                  Boiler House Supplies
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Admin Panel
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <p className="px-3.5 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Management
            </p>

            <nav aria-label="Admin sections" className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 font-medium text-white shadow-md shadow-slate-900/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogoutIcon className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64 lg:h-screen lg:overflow-y-auto">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                  aria-expanded={sidebarOpen}
                  aria-controls="admin-sidebar"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                >
                  <MenuIcon className="h-4 w-4" />
                </button>

                <p className="text-sm font-semibold text-slate-900">
                  Manage Categories
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  A
                </span>
                Admin
              </span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Catalogue
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Manage Categories
                  </h1>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Organise the catalogue into categories and control where
                  products belong.
                </p>
              </div>

              <button
                type="button"
                onClick={startNewCategory}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25"
              >
                <PlusIcon className="h-4 w-4" />
                Add Category
              </button>
            </div>

            {status ? (
              <p
                role="status"
                className="mt-5 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-5 text-slate-600"
              >
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
                <span className="min-w-0">{status}</span>
              </p>
            ) : null}

            {categories.length > 0 ? (
              <section
                aria-label="Home page featured categories"
                className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl shadow-slate-300/40 backdrop-blur-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
                      <StarIcon className="h-4 w-4" />
                    </span>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Home Page Featured Categories
                      </h2>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                        {maxFeatured === MAX_FEATURED_CATEGORIES
                          ? "Select exactly 3 categories to show in the Featured Categories section on the home page."
                          : `Your catalogue has ${categories.length} categor${categories.length === 1 ? "y" : "ies"}. All available categories will be featured until you add more.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {featuredIds.length} of {maxFeatured} selected
                    </span>

                    <button
                      type="button"
                      onClick={handleSaveFeatured}
                      disabled={!featuredReady || featuredSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      {featuredSaving ? "Saving..." : "Save Selection"}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
                  {categories.map((category) => {
                    const checked = featuredIds.includes(category.id);
                    const disabled =
                      !checked && featuredIds.length >= maxFeatured;

                    return (
                      <label
                        key={category.id}
                        className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                          checked
                            ? "border-slate-900 bg-slate-900/[0.04]"
                            : "border-slate-200 bg-white"
                        } ${
                          disabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleFeaturedCategory(category.id)}
                          className="h-4 w-4 shrink-0 accent-slate-900"
                        />

                        {category.image ? (
                          <img
                            src={category.image}
                            alt=""
                            loading="lazy"
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
                          />
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                            <TagIcon className="h-5 w-5" />
                          </span>
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {category.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {productCounts[category.id] ?? 0} product
                            {(productCounts[category.id] ?? 0) === 1 ? "" : "s"}
                          </span>
                        </span>

                        {checked ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                            {featuredIds.indexOf(category.id) + 1}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                {featuredStatus.message ? (
                  <p
                    role="status"
                    className={`border-t px-4 py-2.5 text-xs leading-5 sm:px-5 ${
                      featuredStatus.type === "error"
                        ? "border-rose-100 bg-rose-50 text-rose-700"
                        : "border-emerald-100 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {featuredStatus.message}
                  </p>
                ) : null}
              </section>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section
                aria-label="Categories"
                className="min-w-0 overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl shadow-slate-300/40 backdrop-blur-sm"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="relative w-full sm:max-w-sm">
                    <label htmlFor="category-search" className="sr-only">
                      Search categories
                    </label>

                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="category-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search categories"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                    />
                  </div>

                  <p className="shrink-0 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">
                      {filteredCategories.length}
                    </span>{" "}
                    of {categories.length} categories
                  </p>
                </div>

                {categoriesLoading && categories.length === 0 ? (
                  <div className="space-y-3 p-5">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                ) : categoriesError ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center justify-center px-6 py-16 text-center"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100">
                      <TagIcon className="h-6 w-6" />
                    </span>

                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                      Categories could not be loaded
                    </h2>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      {categoriesError}
                    </p>

                    <button
                      type="button"
                      onClick={reloadCategories}
                      className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredCategories.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <th scope="col" className="px-5 py-3">
                            Category
                          </th>
                          <th scope="col" className="px-5 py-3">
                            Description
                          </th>
                          <th scope="col" className="px-5 py-3">
                            Products
                          </th>
                          <th scope="col" className="px-5 py-3 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredCategories.map((category) => {
                          const count = productCounts[category.id] ?? 0;

                          return (
                            <tr
                              key={category.id}
                              className={`transition-colors hover:bg-slate-50/70 ${
                                editingId === category.id
                                  ? "bg-slate-50/80"
                                  : ""
                              }`}
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {category.image ? (
                                    <img
                                      src={category.image}
                                      alt=""
                                      loading="lazy"
                                      className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
                                    />
                                  ) : (
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                                      {getInitials(category.name)}
                                    </span>
                                  )}

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-900">
                                      {category.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                      {category.slug}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p
                                  className="line-clamp-2 max-w-xs text-xs leading-5 text-slate-500"
                                  title={category.description}
                                >
                                  {category.description ||
                                    "No description added yet."}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex min-w-8 items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                    count
                                      ? "border-sky-100 bg-sky-50 text-slate-700"
                                      : "border-slate-200 bg-slate-50 text-slate-400"
                                  }`}
                                >
                                  {count}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(category)}
                                    aria-label={`Edit ${category.name}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                  >
                                    <EditIcon className="h-3.5 w-3.5" />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openDelete(category)}
                                    aria-label={`Delete ${category.name}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : categories.length ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200">
                      <SearchIcon className="h-6 w-6" />
                    </span>

                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                      No categories found
                    </h2>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      No categories match this search. Try a different
                      keyword.
                    </p>

                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                      <TagIcon className="h-6 w-6" />
                    </span>

                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                      No categories yet
                    </h2>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">
                      Create your first category to start organising the
                      catalogue.
                    </p>

                    <button
                      type="button"
                      onClick={startNewCategory}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Category
                    </button>
                  </div>
                )}
              </section>

              <aside
                id="category-form"
                aria-labelledby="category-form-title"
                className="self-start rounded-3xl border border-white/80 bg-white/85 p-5 shadow-2xl shadow-slate-300/40 backdrop-blur-sm sm:p-6 lg:sticky lg:top-24"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id="category-form-title"
                      className="text-base font-semibold text-slate-900"
                    >
                      {editingId ? "Edit Category" : "Add Category"}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {editingId
                        ? "Update the category name, image or description."
                        : "Create a new category for the catalogue."}
                    </p>
                  </div>

                  {editingId ? (
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Editing
                    </span>
                  ) : null}
                </div>

                <form className="mt-5" noValidate onSubmit={handleSubmit}>
                  <label
                    htmlFor="category-name"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Category Name
                    <span className="ml-0.5 text-rose-500">*</span>
                  </label>

                  <input
                    id="category-name"
                    name="name"
                    type="text"
                    maxLength={60}
                    placeholder="e.g. Pressure Gauges"
                    value={values.name}
                    onChange={handleFieldChange}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "category-name-error" : undefined
                    }
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.name
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                  />

                  {errors.name ? (
                    <p
                      id="category-name-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.name}
                    </p>
                  ) : null}

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="category-image"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Category Image
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      {imagePreview ? (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[11px] font-semibold text-rose-600 transition-colors hover:text-rose-700"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div
                      className={`mt-1.5 flex items-center gap-3 rounded-xl border border-dashed p-3 ${
                        errors.image
                          ? "border-rose-300 bg-rose-50/40"
                          : "border-slate-300 bg-slate-50/70"
                      }`}
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                        />
                      ) : (
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
                          <PackageIcon className="h-6 w-6" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-5 text-slate-500">
                          JPG, PNG, WEBP or GIF. Maximum 5 MB.
                        </p>

                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="mt-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          {imagePreview ? "Replace image" : "Upload image"}
                        </button>
                      </div>

                      <input
                        id="category-image"
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>

                    {errors.image ? (
                      <p
                        role="alert"
                        className="mt-1 text-xs text-rose-600"
                      >
                        {errors.image}
                      </p>
                    ) : null}
                  </div>

                  <label
                    htmlFor="category-description"
                    className="mt-4 block text-xs font-medium text-slate-700"
                  >
                    Description
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="category-description"
                    name="description"
                    rows={4}
                    maxLength={300}
                    placeholder="Short summary of the products in this category."
                    value={values.description}
                    onChange={handleFieldChange}
                    className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm leading-6 text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                  />

                  <p className="mt-1 text-right text-[10px] text-slate-400">
                    {values.description.length}/300
                  </p>

                  {formError ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-5 text-rose-700"
                    >
                      {formError}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {submitting ? (
                        "Saving..."
                      ) : editingId ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Update Category
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          Create Category
                        </>
                      )}
                    </button>

                    {editingId ? (
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setStatus("");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        Cancel editing
                      </button>
                    ) : null}
                  </div>
                </form>

                <p className="mt-4 text-[11px] leading-5 text-slate-400">
                  Categories are saved to MongoDB and appear automatically on
                  the website and in the Add Product category dropdown.
                </p>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDelete();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md rounded-2xl border border-white/80 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="delete-category-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Delete &ldquo;{pendingDelete.name}&rdquo;?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {pendingCount
                    ? "Products in this category must be moved before it can be deleted."
                    : "This category has no products. It will be removed from the catalogue."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDelete}
                aria-label="Close delete dialog"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {pendingCount ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <p className="text-xs leading-5 text-amber-900">
                  <span className="font-semibold">
                    {pendingCount} product{pendingCount === 1 ? "" : "s"}
                  </span>{" "}
                  currently belong to this category. Choose where to move them.
                </p>

                {reassignOptions.length ? (
                  <div className="relative mt-3">
                    <label
                      htmlFor="reassign-category"
                      className="sr-only"
                    >
                      Move products to
                    </label>

                    <select
                      id="reassign-category"
                      value={reassignTo}
                      onChange={(event) =>
                        setReassignTo(event.target.value)
                      }
                      autoFocus
                      className={`w-full appearance-none rounded-xl border border-amber-200 bg-white py-2.5 pl-3.5 pr-10 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10 ${
                        reassignTo ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      <option value="">Select a category</option>
                      {reassignOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-amber-900">
                    Create another category before deleting this one.
                  </p>
                )}
              </div>
            ) : null}

            {deleteError ? (
              <p role="alert" className="mt-3 text-xs text-rose-600">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDelete}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={
                  deleting ||
                  (Boolean(pendingCount) &&
                    (!reassignTo || !reassignOptions.length))
                }
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : pendingCount
                    ? "Reassign & delete"
                    : "Delete category"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
