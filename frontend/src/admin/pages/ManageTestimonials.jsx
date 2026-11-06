import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../../api.js";
import {
  CheckIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  StarIcon,
} from "../../components/Icons.jsx";
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

function ReplyIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M9.5 6 4 11.5 9.5 17" />
      <path d="M4 11.5h9a6.5 6.5 0 0 1 6.5 6.5v1" />
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

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const FIELD_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10";

const MAX_REPLY_LENGTH = 1000;

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeReview(review) {
  return {
    id: String(review._id || review.id || ""),
    customerName: review.customerName || review.name || "",
    companyName: review.companyName || "",
    location: review.location || "",
    rating: Number(review.rating) || 0,
    review: review.review || "",
    status: review.status || "pending",
    adminReply: review.adminReply || "",
    adminRepliedAt: review.adminRepliedAt || null,
    createdAt: review.createdAt || review.date || review.updatedAt,
    updatedAt: review.updatedAt || review.createdAt,
  };
}

function formatStatus(status) {
  return (status || "pending").replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            filled={star <= rating}
            className={`h-3.5 w-3.5 ${
              star <= rating ? "text-amber-500" : "text-slate-200"
            }`}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-slate-500">{rating}/5</span>
    </div>
  );
}

export default function ManageTestimonials() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const loadReviews = useCallback(
    async (signal) => {
      setLoading(true);
      setLoadError("");

      try {
        const token = getAdminToken();
        const response = await api.get("/reviews/admin", {
          signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const records = response.data?.reviews;

        if (!Array.isArray(records)) {
          throw new Error(
            "The reviews response did not contain a reviews list.",
          );
        }

        setReviews(records.map(normalizeReview));
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
            "Unable to load reviews. Make sure the backend is running and try again.",
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
    loadReviews(controller.signal);
    return () => controller.abort();
  }, [loadReviews]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;

      setSidebarOpen(false);
      setConfirmingId(null);
      setReplyingTo(null);
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

  function handleRequestError(requestError, fallback) {
    if (requestError.response?.status === 401) {
      clearAdminToken();
      navigate("/admin/login", { replace: true });
      return;
    }

    setStatus(
      requestError.response?.data?.message ||
        requestError.message ||
        fallback,
    );
  }

  const counts = {
    all: reviews.length,
    pending: reviews.filter((review) => review.status === "pending").length,
    approved: reviews.filter((review) => review.status === "approved").length,
    rejected: reviews.filter((review) => review.status === "rejected").length,
  };

  const searchTerm = query.trim().toLowerCase();
  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      statusFilter === "all" ? true : review.status === statusFilter;
    const matchesQuery = searchTerm
      ? `${review.customerName} ${review.companyName} ${review.location} ${review.review}`
          .toLowerCase()
          .includes(searchTerm)
      : true;

    return matchesStatus && matchesQuery;
  });

  async function updateStatus(review, nextStatus) {
    if (review.status === nextStatus || busyId) return;

    setBusyId(review.id);
    setStatus("");

    try {
      const token = getAdminToken();
      const response = await api.put(
        `/reviews/${review.id}`,
        { status: nextStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      if (response.data?.success !== true || !response.data.review) {
        throw new Error(
          response.data?.message || "Unable to update the review status.",
        );
      }

      const updated = normalizeReview(response.data.review);
      setReviews((current) =>
        current.map((item) => (item.id === review.id ? updated : item)),
      );
      setStatus(
        `Review from "${review.customerName}" was ${nextStatus}.`,
      );
    } catch (requestError) {
      handleRequestError(requestError, "Unable to update the review status.");
    } finally {
      setBusyId(null);
    }
  }

  function openReply(review) {
    setReplyingTo(review);
    setReplyText(review.adminReply || "");
    setReplyError("");
    setStatus("");
  }

  function closeReply() {
    if (savingReply) return;

    setReplyingTo(null);
    setReplyText("");
    setReplyError("");
  }

  function handleReplyChange(event) {
    setReplyText(event.target.value);
    setReplyError("");
  }

  async function saveReply(event) {
    event.preventDefault();

    if (!replyingTo || savingReply) return;

    const message = replyText.trim();

    if (!message) {
      setReplyError("Reply message is required.");
      return;
    }

    if (message.length > MAX_REPLY_LENGTH) {
      setReplyError(`Reply cannot exceed ${MAX_REPLY_LENGTH} characters.`);
      return;
    }

    setSavingReply(true);
    setReplyError("");

    try {
      const token = getAdminToken();
      const response = await api.put(
        `/reviews/${replyingTo.id}/reply`,
        { adminReply: message },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      if (response.data?.success !== true || !response.data.review) {
        throw new Error(response.data?.message || "Unable to save the reply.");
      }

      const updated = normalizeReview(response.data.review);
      setReviews((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setReplyingTo(null);
      setReplyText("");
      setStatus(`Reply saved for "${updated.customerName}".`);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }

      setReplyError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to save the reply.",
      );
    } finally {
      setSavingReply(false);
    }
  }

  async function deleteReview(review) {
    setBusyId(review.id);
    setStatus("");

    try {
      const token = getAdminToken();
      const response = await api.delete(`/reviews/${review.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message || "Unable to delete the review.",
        );
      }

      setReviews((current) =>
        current.filter((item) => item.id !== review.id),
      );
      setConfirmingId(null);
      setStatus(`Review from "${review.customerName}" was deleted.`);
    } catch (requestError) {
      handleRequestError(requestError, "Unable to delete the review.");
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
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
                  Manage Testimonials
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
                Customer Feedback
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Manage Testimonials
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Approve, reject, reply to or delete customer reviews. Only
                approved reviews appear on the public Testimonials page.
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
              aria-label="Customer reviews"
              className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-2xl shadow-slate-300/40 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-wrap gap-2">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      aria-pressed={statusFilter === tab.key}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                        statusFilter === tab.key
                          ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          statusFilter === tab.key
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {counts[tab.key]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <label htmlFor="review-search" className="sr-only">
                      Search reviews
                    </label>

                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="review-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by customer, company or review"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                    />
                  </div>

                  <p className="shrink-0 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">
                      {filteredReviews.length}
                    </span>{" "}
                    of {reviews.length} reviews
                  </p>
                </div>
              </div>

              {filteredReviews.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/80 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <th scope="col" className="px-5 py-3">
                          Customer
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Review
                        </th>
                        <th scope="col" className="px-5 py-3">
                          Rating
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
                      {filteredReviews.map((review) => {
                        const isBusy = busyId === review.id;

                        return (
                          <tr
                            key={review.id}
                            className="align-top transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {review.customerName}
                                </p>
                                {review.companyName ? (
                                  <p className="mt-0.5 truncate text-xs text-slate-500">
                                    {review.companyName}
                                  </p>
                                ) : null}
                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  {review.location || "—"}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p
                                className="max-w-sm whitespace-pre-line text-xs leading-6 text-slate-600"
                                title={review.review}
                              >
                                {review.review}
                              </p>
                              {review.adminReply ? (
                                <div className="mt-3 max-w-sm border-l-2 border-slate-300 pl-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Admin reply
                                  </p>
                                  <p className="mt-1 whitespace-pre-line text-xs leading-6 text-slate-600">
                                    {review.adminReply}
                                  </p>
                                </div>
                              ) : null}
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <RatingStars rating={review.rating} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                              {formatDate(review.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={review.status} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {confirmingId === review.id ? (
                                  <>
                                    <span className="text-xs text-slate-500">
                                      Delete?
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => deleteReview(review)}
                                      disabled={isBusy}
                                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isBusy ? "Deleting…" : "Delete"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setConfirmingId(null)}
                                      disabled={isBusy}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateStatus(review, "approved")
                                      }
                                      disabled={
                                        isBusy || review.status === "approved"
                                      }
                                      aria-label={`Approve review from ${review.customerName}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <CheckIcon className="h-3.5 w-3.5" />
                                      Approve
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateStatus(review, "rejected")
                                      }
                                      disabled={
                                        isBusy || review.status === "rejected"
                                      }
                                      aria-label={`Reject review from ${review.customerName}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <CloseIcon className="h-3.5 w-3.5" />
                                      Reject
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openReply(review)}
                                      disabled={isBusy}
                                      aria-label={`Reply to review from ${review.customerName}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <ReplyIcon className="h-3.5 w-3.5" />
                                      Reply
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setConfirmingId(review.id)}
                                      disabled={isBusy}
                                      aria-label={`Delete review from ${review.customerName}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  Loading reviews…
                </p>
              ) : loadError ? (
                <div role="alert" className="px-6 py-16 text-center">
                  <h2 className="text-base font-semibold text-slate-900">
                    Unable to load reviews
                  </h2>
                  <p className="mt-1 text-sm text-rose-600">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => loadReviews()}
                    className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Try again
                  </button>
                </div>
              ) : reviews.length ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <SearchIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No reviews found
                  </h2>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    No reviews match this search or status filter. Try a
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
                    <StarIcon className="h-6 w-6" />
                  </span>

                  <h2 className="mt-4 text-base font-semibold text-slate-900">
                    No reviews yet
                  </h2>
                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Reviews submitted through the public Testimonials page will
                    appear here as pending for approval.
                  </p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {replyingTo ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReply();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-reply-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/80 bg-white p-5 shadow-2xl shadow-slate-900/20 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="review-reply-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Reply to Review
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {replyingTo.customerName}
                  {replyingTo.companyName ? ` · ${replyingTo.companyName}` : ""}
                  {" · "}
                  {formatDate(replyingTo.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReply}
                aria-label="Close reply"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Customer review
              </p>
              <p className="mt-1.5 whitespace-pre-line text-xs leading-6 text-slate-600">
                {replyingTo.review}
              </p>
            </div>

            <form onSubmit={saveReply} noValidate className="mt-4 grid gap-4">
              {replyError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-5 text-rose-700"
                >
                  {replyError}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor="reply-message"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  Your reply
                </label>
                <textarea
                  id="reply-message"
                  name="adminReply"
                  rows={4}
                  maxLength={MAX_REPLY_LENGTH}
                  value={replyText}
                  onChange={handleReplyChange}
                  placeholder="Thank you for your feedback!"
                  className={`${FIELD_CLASS} resize-y`}
                />
                <div className="mt-1 flex items-start justify-between gap-2">
                  <span className="text-[10px] leading-5 text-slate-400">
                    {replyingTo.adminReply
                      ? "Saving will replace the existing reply."
                      : "This reply will appear below the review on the Testimonials page."}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-slate-400">
                    {replyText.trim().length}/{MAX_REPLY_LENGTH}
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReply}
                  disabled={savingReply}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingReply}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingReply
                    ? "Saving…"
                    : replyingTo.adminReply
                      ? "Update Reply"
                      : "Save Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
