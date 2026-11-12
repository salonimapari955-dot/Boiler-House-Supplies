import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../api.js";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  StarIcon,
} from "../../components/Icons.jsx";
import EnquiriesBadge from "../components/EnquiriesBadge.jsx";
import { notifyEnquiriesUpdated } from "../hooks/useUnreadEnquiries.js";
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

function SearchIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
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

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeEnquiry(enquiry) {
  return {
    ...enquiry,
    id: String(enquiry._id || enquiry.id),
    name: enquiry.name || "",
    email: enquiry.email || "",
    phone: enquiry.phone || enquiry.mobile || "",
    message: enquiry.message || enquiry.requirement || "",
    status: enquiry.status || "new",
    date: enquiry.createdAt || enquiry.date || enquiry.updatedAt,
  };
}

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30];
const DEFAULT_PAGE_SIZE = 10;

function toTimestamp(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function filterEnquiries(records, searchTerm, statusFilter) {
  return records.filter((enquiry) => {
    const enquiryStatus = enquiry.status ?? "new";
    const matchesStatus =
      statusFilter === "new"
        ? enquiryStatus !== "read"
        : statusFilter === "read"
          ? enquiryStatus === "read"
          : true;
    const matchesQuery = searchTerm
      ? `${enquiry.name} ${enquiry.email} ${enquiry.phone} ${enquiry.message}`
          .toLowerCase()
          .includes(searchTerm)
      : true;

    return matchesStatus && matchesQuery;
  });
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

function StatusBadge({ status }) {
  const normalizedStatus = status || "new";
  const statusStyles = {
    new: "border-slate-900 bg-slate-900 text-white",
    contacted: "border-amber-200 bg-amber-50 text-amber-700",
    read: "border-slate-200 bg-slate-100 text-slate-500",
    "in-progress": "border-blue-200 bg-blue-50 text-blue-700",
    resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  const label = normalizedStatus
    .replace("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        statusStyles[normalizedStatus] || statusStyles.new
      }`}
    >
      {label}
    </span>
  );
}

export default function ManageEnquiries() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [confirmingId, setConfirmingId] = useState(null);
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [status, setStatus] = useState("");

  const loadEnquiries = useCallback(
    async (signal) => {
      setLoading(true);
      setLoadError("");

      try {
        const token = getAdminToken();
        const response = await api.get("/enquiries", {
          signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const records = response.data?.enquiries;

        if (!Array.isArray(records)) {
          throw new Error("The enquiries response did not contain an enquiries list.");
        }

        setEnquiries(
          records
            .map(normalizeEnquiry)
            .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date)),
        );
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED" || signal?.aborted) return;

        if (requestError.response?.status === 401) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        setLoadError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load enquiries. Make sure the backend is running and try again.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const controller = new AbortController();
    // Load state is updated asynchronously as the API request starts/completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEnquiries(controller.signal);
    return () => controller.abort();
  }, [loadEnquiries]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      setSidebarOpen(false);
      setActiveEnquiry(null);
      setConfirmingId(null);
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

  const searchTerm = query.trim().toLowerCase();
  const filteredEnquiries = filterEnquiries(
    enquiries,
    searchTerm,
    statusFilter,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnquiries.length / pageSize),
  );
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleEnquiries = filteredEnquiries.slice(
    pageStart,
    pageStart + pageSize,
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const rangeStart = filteredEnquiries.length ? pageStart + 1 : 0;
  const rangeEnd = Math.min(
    pageStart + pageSize,
    filteredEnquiries.length,
  );

  const unreadCount = enquiries.filter(
    (enquiry) => (enquiry.status ?? "new") !== "read",
  ).length;

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }

  async function markAsRead(id) {
    const target = enquiries.find((enquiry) => enquiry.id === id);

    if (!target || (target.status ?? "new") === "read") return;

    try {
      const token = getAdminToken();
      const response = await api.patch(
        `/enquiries/${id}/status`,
        { status: "read" },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      if (response.data?.success !== true || !response.data.enquiry) {
        throw new Error(response.data?.message || "Unable to update enquiry status.");
      }

      const updatedEnquiry = normalizeEnquiry(response.data.enquiry);
      const updatedEnquiries = enquiries.map((enquiry) =>
        enquiry.id === id ? updatedEnquiry : enquiry,
      );
      const updatedFiltered = filterEnquiries(
        updatedEnquiries,
        searchTerm,
        statusFilter,
      );
      const lastPage = Math.max(
        1,
        Math.ceil(updatedFiltered.length / pageSize),
      );

      setEnquiries(updatedEnquiries);
      setPage((current) => Math.min(current, lastPage));
      setActiveEnquiry((current) =>
        current?.id === id ? updatedEnquiry : current,
      );
      setStatus(`Enquiry from "${target.name}" was marked as read.`);
      notifyEnquiriesUpdated();
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }

      setStatus(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to update enquiry status.",
      );
    }
  }

  async function deleteEnquiry(id) {
    const target = enquiries.find((enquiry) => enquiry.id === id);

    if (!target) return;

    try {
      const token = getAdminToken();
      const response = await api.delete(`/enquiries/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data?.success !== true) {
        throw new Error(response.data?.message || "Unable to delete enquiry.");
      }

      const remainingEnquiries = enquiries.filter(
        (enquiry) => enquiry.id !== id,
      );
      const remainingFiltered = filterEnquiries(
        remainingEnquiries,
        searchTerm,
        statusFilter,
      );
      const lastPage = Math.max(
        1,
        Math.ceil(remainingFiltered.length / pageSize),
      );

      setEnquiries(remainingEnquiries);
      setPage((current) => Math.min(current, lastPage));
      if (activeEnquiry?.id === id) setActiveEnquiry(null);
      setConfirmingId(null);
      setStatus(`Enquiry from "${target.name}" was deleted.`);
      notifyEnquiriesUpdated();
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }

      setStatus(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to delete enquiry.",
      );
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("");
    setPage(1);
  }

  function changePageSize(event) {
    setPageSize(Number(event.target.value));
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
                  Manage Enquiries
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
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Customer Care
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Manage Enquiries
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Review customer enquiries and keep track of their status.
              </p>
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

            <section
              aria-label="Customer enquiries"
              className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl shadow-slate-300/40 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row">
                  <div className="relative flex-1">
                    <label htmlFor="enquiry-search" className="sr-only">
                      Search enquiries
                    </label>

                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="enquiry-search"
                      type="search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by name, email, phone or message"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                    />
                  </div>

                  <div className="relative sm:w-44">
                    <label htmlFor="enquiry-status-filter" className="sr-only">
                      Filter by status
                    </label>

                    <select
                      id="enquiry-status-filter"
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                      }}
                      className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-10 text-sm transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10 ${
                        statusFilter ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      <option value="">All statuses</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                    </select>

                    <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <p className="shrink-0 text-xs text-slate-500">
                  <span className="font-semibold text-slate-900">
                    {filteredEnquiries.length}
                  </span>{" "}
                  of {enquiries.length} enquiries
                  {unreadCount ? (
                    <span className="ml-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {unreadCount} unread
                    </span>
                  ) : null}
                </p>
              </div>

              {filteredEnquiries.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <th scope="col" className="px-5 py-3">
                          Customer
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Phone
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Message
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Date
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Status
                        </th>
                        <th scope="col" className="px-5 py-3 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {visibleEnquiries.map((enquiry) => {
                        const isUnread = (enquiry.status ?? "new") !== "read";

                        return (
                          <tr
                            key={enquiry.id}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-start gap-2">
                                <span
                                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                    isUnread ? "bg-slate-900" : "bg-transparent"
                                  }`}
                                  aria-hidden="true"
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900">
                                    {enquiry.name}
                                  </p>

                                  {enquiry.email ? (
                                    <a
                                      href={`mailto:${enquiry.email}`}
                                      title={enquiry.email}
                                      className="mt-0.5 block truncate text-xs text-slate-400 transition-colors hover:text-slate-900 hover:underline"
                                    >
                                      {enquiry.email}
                                    </a>
                                  ) : (
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      —
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                              {enquiry.phone ? (
                                <a
                                  href={`tel:${enquiry.phone}`}
                                  className="transition-colors hover:text-slate-900 hover:underline"
                                >
                                  {enquiry.phone}
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p
                                className="max-w-xs truncate text-xs text-slate-500"
                                title={enquiry.message}
                              >
                                {enquiry.message}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                              {formatDate(enquiry.date)}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={enquiry.status} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {confirmingId === enquiry.id ? (
                                  <>
                                    <span className="text-xs text-slate-500">
                                      Delete?
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteEnquiry(enquiry.id)
                                      }
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
                                      onClick={() =>
                                        setActiveEnquiry(enquiry)
                                      }
                                      aria-label={`View enquiry from ${enquiry.name}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                                    >
                                      <EyeIcon className="h-3.5 w-3.5" />
                                      View Details
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => markAsRead(enquiry.id)}
                                      disabled={!isUnread}
                                      aria-label={`Mark enquiry from ${enquiry.name} as read`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <CheckIcon className="h-3.5 w-3.5" />
                                      Mark as Read
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmingId(enquiry.id)
                                      }
                                      aria-label={`Delete enquiry from ${enquiry.name}`}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : loading ? (
                <p className="px-6 py-16 text-center text-sm text-slate-500">
                  Loading enquiries…
                </p>
              ) : loadError ? (
                <div role="alert" className="px-6 py-16 text-center">
                  <h2 className="text-base font-semibold text-slate-900">
                    Unable to load enquiries
                  </h2>
                  <p className="mt-1 text-sm text-rose-600">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => loadEnquiries()}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Try again
                  </button>
                </div>
              ) : enquiries.length ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <SearchIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No enquiries found
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    No enquiries match this search or status filter. Try a
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
                    <MailIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No enquiries yet
                  </h2>
                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Customer enquiries submitted through the website contact
                    form will appear here with their contact details and
                    message.
                  </p>
                </div>
              )}

              {filteredEnquiries.length > 0 ? (
                <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
                    <label
                      htmlFor="enquiry-page-size"
                      className="font-medium text-slate-600"
                    >
                      Rows per page
                    </label>

                    <div className="relative">
                      <select
                        id="enquiry-page-size"
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
                        {filteredEnquiries.length}
                      </span>{" "}
                      {filteredEnquiries.length === 1
                        ? "enquiry"
                        : "enquiries"}
                    </span>
                  </div>

                  <nav
                    aria-label="Enquiry pagination"
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
          </main>
        </div>
      </div>

      {activeEnquiry ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveEnquiry(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/80 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="enquiry-details-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Enquiry Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Received {formatDate(activeEnquiry.date)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={activeEnquiry.status} />

                <button
                  type="button"
                  onClick={() => setActiveEnquiry(null)}
                  aria-label="Close enquiry details"
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Customer Name
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {activeEnquiry.name}
                </dd>
              </div>

              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-slate-700">
                  {activeEnquiry.phone ? (
                    <a
                      href={`tel:${activeEnquiry.phone}`}
                      className="transition-colors hover:text-slate-900 hover:underline"
                    >
                      {activeEnquiry.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 break-all text-sm text-slate-700">
                  <a
                    href={`mailto:${activeEnquiry.email}`}
                    className="transition-colors hover:text-slate-900 hover:underline"
                  >
                    {activeEnquiry.email}
                  </a>
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Message
                </dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-sm leading-6 text-slate-600">
                  {activeEnquiry.message}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setActiveEnquiry(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>

              {(activeEnquiry.status ?? "new") !== "read" ? (
                <button
                  type="button"
                  onClick={() => markAsRead(activeEnquiry.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
                >
                  <CheckIcon className="h-4 w-4" />
                  Mark as Read
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
