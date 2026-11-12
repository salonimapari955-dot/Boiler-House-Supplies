import { useEffect, useState } from "react";
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
import { clearAdminToken } from "../auth.js";
import { useAdminProducts } from "../hooks/useAdminProducts.js";
import { useCategories } from "../../hooks/useCategories.js";
import SearchableCategorySelect from "../components/SearchableCategorySelect.jsx";
import EnquiriesBadge from "../components/EnquiriesBadge.jsx";

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
  { label: "Enquiries", to: "/admin/enquiries", icon: MailIcon },
  { label: "Categories", to: "/admin/categories", icon: TagIcon },
  {
    label: "Manage Products",
    to: "/admin/manage-products",
    icon: PackageIcon,
  },
  { label: "Add Product", to: "/admin/add-product", icon: PlusIcon },
  { label: "Testimonials", to: "/admin/testimonials", icon: StarIcon },
];

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30];
const DEFAULT_PAGE_SIZE = 10;

function toTimestamp(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [
    ...new Set([
      1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]),
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1];
    const needsEllipsis = index > 0 && page - previousPage > 1;

    return needsEllipsis ? [`ellipsis-${previousPage}`, page] : [page];
  });
}

export default function ManageProducts() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const {
    products,
    loading,
    error,
    reload,
    remove,
    restore,
  } = useAdminProducts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [confirmingId, setConfirmingId] = useState(null);
  const [lastRemoved, setLastRemoved] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setSidebarOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleLogout() {
    clearAdminToken();
    closeSidebar();
    navigate("/", { replace: true });
  }

  const searchTerm = query.trim().toLowerCase();

  const orderedProducts = [...products].sort(
    (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt),
  );

  const filteredProducts = orderedProducts.filter((product) => {
    const matchesCategory = category ? product.category === category : true;
    const matchesQuery = searchTerm
      ? `${product.name} ${product.category}`
          .toLowerCase()
          .includes(searchTerm)
      : true;

    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize),
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProducts = filteredProducts.slice(
    pageStart,
    pageStart + pageSize,
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const rangeStart = filteredProducts.length ? pageStart + 1 : 0;
  const rangeEnd = Math.min(
    pageStart + pageSize,
    filteredProducts.length,
  );

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  function changePageSize(event) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  function handleEdit(product) {
    setConfirmingId(null);
    setLastRemoved(null);
    navigate(`/admin/edit-product/${product.id}`);
  }

  async function handleDelete(product) {
    setStatus("");

    try {
      await remove(product.id);
      const remainingProducts = products.filter(
        (item) => item.id !== product.id,
      );
      const remainingFiltered = remainingProducts.filter((item) => {
        const matchesCategory = category
          ? item.category === category
          : true;
        const matchesQuery = searchTerm
          ? `${item.name} ${item.category}`
              .toLowerCase()
              .includes(searchTerm)
          : true;

        return matchesCategory && matchesQuery;
      });
      const lastPage = Math.max(
        1,
        Math.ceil(remainingFiltered.length / pageSize),
      );

      setPage((current) => Math.min(current, lastPage));
      setConfirmingId(null);
      setLastRemoved(product);
      setStatus(`"${product.name}" was deleted.`);
    } catch (requestError) {
      setConfirmingId(null);
      setStatus(
        requestError.response?.data?.message ||
          "Unable to delete this product. Please try again.",
      );
    }
  }

  async function handleUndo() {
    if (!lastRemoved) return;

    try {
      await restore(lastRemoved);
      setStatus(`"${lastRemoved.name}" was restored.`);
      setLastRemoved(null);
      setPage(1);
    } catch (requestError) {
      setStatus(
        requestError.response?.data?.message ||
          "Unable to restore this product. Please try again.",
      );
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setPage(1);
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
                    {item.to === "/admin/enquiries" ? (
                      <EnquiriesBadge />
                    ) : null}
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
                  Manage Products
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
                    Manage Products
                  </h1>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                    Live Data
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Review the products in your catalogue and keep their details
                  up to date.
                </p>
              </div>

              <Link
                to="/admin/add-product"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25"
              >
                <PlusIcon className="h-4 w-4" />
                Add Product
              </Link>
            </div>

            <section
              aria-label="Product list"
              className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl shadow-slate-300/40 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
                  <div className="relative flex-1">
                    <label htmlFor="product-search" className="sr-only">
                      Search products
                    </label>

                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="product-search"
                      type="search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by product name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="relative sm:w-56">
                    <label htmlFor="product-category-filter" className="sr-only">
                      Filter by category
                    </label>

                    <SearchableCategorySelect
                      id="product-category-filter"
                      value={category}
                      onChange={(nextCategory) => {
                        setCategory(nextCategory);
                        setPage(1);
                      }}
                      options={categories.map((item) => ({
                        value: item.name,
                        label: item.name,
                      }))}
                      placeholder="All categories"
                      variant="filter"
                    />
                  </div>
                </div>

                <p className="shrink-0 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {filteredProducts.length}
                  </span>{" "}
                  of {products.length} products
                </p>
              </div>

              {status ? (
                <div
                  role="status"
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-sky-50 px-4 py-2.5 text-xs leading-5 text-slate-600 sm:px-5"
                >
                  <span className="flex min-w-0 items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
                    <span className="min-w-0">{status}</span>
                  </span>

                  {lastRemoved ? (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Undo
                    </button>
                  ) : null}
                </div>
              ) : null}

              {loading ? (
                <div
                  role="status"
                  className="space-y-3 p-5"
                >
                  <span className="sr-only">Loading products...</span>
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="flex flex-col items-center justify-center px-6 py-16 text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200">
                    <CloseIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    Products could not be loaded
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={reload}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredProducts.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <th scope="col" className="px-5 py-3">
                          Product
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Category
                        </th>
                        <th scope="col" className="px-5 py-3 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visibleProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  loading="lazy"
                                  className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
                                />
                              ) : (
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 shadow-sm">
                                  <PackageIcon className="h-5 w-5" />
                                </span>
                              )}

                              <p className="min-w-0 truncate text-sm font-medium text-slate-900">
                                {product.name}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {product.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {confirmingId === product.id ? (
                                <>
                                  <span className="text-xs text-slate-500">
                                    Delete?
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(product)}
                                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                                  >
                                    Delete
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setConfirmingId(null)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(product)}
                                    aria-label={`Edit ${product.name}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                  >
                                    <EditIcon className="h-3.5 w-3.5" />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setConfirmingId(product.id)}
                                    aria-label={`Delete ${product.name}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : products.length ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <SearchIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No products found
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    No products match this search or category filter. Try a
                    different keyword or reset the filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
                    <PackageIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No products yet
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Your catalogue is empty. Add your first product to start
                    building the Boiler House Supplies listing.
                  </p>

                  <Link
                    to="/admin/add-product"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Product
                  </Link>
                </div>
              )}

              {filteredProducts.length > 0 ? (
                <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                    <label
                      htmlFor="product-page-size"
                      className="font-medium text-slate-600"
                    >
                      Rows per page
                    </label>

                    <div className="relative">
                      <select
                        id="product-page-size"
                        value={pageSize}
                        onChange={changePageSize}
                        className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    </div>

                    <span>
                      Showing{" "}
                      <span className="font-semibold text-slate-700">
                        {rangeStart}–{rangeEnd}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-700">
                        {filteredProducts.length}
                      </span>{" "}
                      {filteredProducts.length === 1 ? "product" : "products"}
                    </span>
                  </div>

                  <nav
                    aria-label="Product pagination"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700"
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" />
                      Previous
                    </button>

                    {pageNumbers.map((pageNumber) =>
                      typeof pageNumber === "number" ? (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => goToPage(pageNumber)}
                          aria-label={`Go to page ${pageNumber}`}
                          aria-current={
                            pageNumber === currentPage ? "page" : undefined
                          }
                          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition-colors ${
                            pageNumber === currentPage
                              ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ) : (
                        <span
                          key={pageNumber}
                          aria-hidden="true"
                          className="px-1 text-xs text-slate-400"
                        >
                          …
                        </span>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700"
                    >
                      Next
                      <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                  </nav>
                </div>
              ) : null}
            </section>

            <p className="mt-4 text-xs text-slate-400">
              Products are loaded from MongoDB. Editing a product opens the same
              form used to add new products.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
