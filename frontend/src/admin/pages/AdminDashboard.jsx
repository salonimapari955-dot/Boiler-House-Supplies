import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  StarIcon,
} from "../../components/Icons.jsx";
import api from "../../api.js";
import EnquiriesBadge from "../components/EnquiriesBadge.jsx";
import { clearAdminToken, getAdminToken } from "../auth.js";

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

const summaryCards = [
  {
    key: "products",
    label: "Total Products",
    description: "All products in the catalogue",
    icon: PackageIcon,
    accent: "from-slate-900 to-slate-700",
  },
  {
    key: "categories",
    label: "Categories",
    description: "Product groups available",
    icon: TagIcon,
    accent: "from-sky-600 to-blue-500",
  },
  {
    key: "enquiries",
    label: "Enquiries",
    description: "Customer enquiries received",
    icon: MailIcon,
    accent: "from-blue-600 to-sky-500",
  },
];

const statusStyles = {
  new: "border-sky-200 bg-sky-50 text-sky-700",
  contacted: "border-amber-200 bg-amber-50 text-amber-700",
  read: "border-slate-200 bg-slate-100 text-slate-600",
  "in-progress": "border-blue-200 bg-blue-50 text-blue-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatStatus(status) {
  if (!status) return "New";

  return status
    .replace("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value) {
  if (!value) return "\u2014";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "\u2014";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    products: null,
    categories: null,
    enquiries: null,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (signal) => {
      try {
        const token = getAdminToken();

        const [productsResponse, categoriesResponse, enquiriesResponse] =
          await Promise.all([
            api.get("/products", { signal }),
            api.get("/categories", { signal }),
            api.get("/enquiries", {
              signal,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
          ]);

        setStats({
          products:
            productsResponse.data.count ??
            productsResponse.data.products?.length ??
            0,
          categories:
            categoriesResponse.data.count ??
            categoriesResponse.data.categories?.length ??
            0,
          enquiries:
            enquiriesResponse.data.count ??
            enquiriesResponse.data.enquiries?.length ??
            0,
        });
        // Show only the five newest enquiries, newest first. The full list is
        // still available on the Enquiries management page.
        const sortedEnquiries = [
          ...(enquiriesResponse.data.enquiries || []),
        ].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );

        setRecentEnquiries(sortedEnquiries.slice(0, 5));
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED" || signal?.aborted) {
          return;
        }

        if (requestError.response?.status === 401) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard data. Make sure the backend is running and try again.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const controller = new AbortController();

    // State updates happen after the request resolves, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard(controller.signal);

    return () => controller.abort();
  }, [loadDashboard]);

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

  function handleRetry() {
    setLoading(true);
    setError("");
    loadDashboard();
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
                  Dashboard
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
            <section aria-labelledby="overview-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1
                    id="overview-heading"
                    className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
                  >
                    Dashboard Overview
                  </h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    A snapshot of the Boiler House Supplies catalogue.
                  </p>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <p className="leading-6">{error}</p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    Try again
                  </button>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  const count = stats[card.key];
                  const value =
                    loading || error || count === null ? "\u2014" : count;

                  return (
                    <article
                      key={card.label}
                      className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-xl shadow-slate-300/30 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-300/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-md shadow-slate-900/20`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>

                      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                        {value}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {card.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {card.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="mt-6">
              <section
                aria-labelledby="recent-enquiries-heading"
                className="flex flex-col rounded-3xl border border-white/80 bg-white/85 p-5 shadow-xl shadow-slate-300/30 backdrop-blur-sm sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2
                      id="recent-enquiries-heading"
                      className="text-base font-semibold text-slate-900"
                    >
                      Recent Enquiries
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Newest messages from customers.
                    </p>
                  </div>

                  <Link
                    to="/admin/enquiries"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    View all
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {loading ? (
                  <div className="mt-5 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      Loading recent enquiries...
                    </p>
                  </div>
                ) : error ? (
                  <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-6 py-10 text-center">
                    <p className="text-sm font-semibold text-rose-700">
                      Recent enquiries unavailable
                    </p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-rose-600">
                      {error}
                    </p>
                  </div>
                ) : recentEnquiries.length ? (
                  <ul className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                    {recentEnquiries.map((enquiry) => (
                      <li
                        key={enquiry._id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {enquiry.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {enquiry.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 sm:shrink-0">
                          <span className="text-xs text-slate-500">
                            {formatDate(enquiry.createdAt)}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              statusStyles[enquiry.status] || statusStyles.new
                            }`}
                          >
                            {formatStatus(enquiry.status)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                      <MailIcon className="h-6 w-6" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-slate-900">
                      No enquiries yet
                    </p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                      Customer enquiries will show up here.
                    </p>
                    <Link
                      to="/admin/enquiries"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Open enquiries
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
