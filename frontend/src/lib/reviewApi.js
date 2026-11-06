import api from "../api.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatReviewDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}

/**
 * Convert a review returned by the API into the shape used by
 * CustomerReviewCard. The public review schema does not include a product, so
 * the product tag is left empty for website submissions.
 */
export function toDisplayReview(raw) {
  return {
    id: raw._id || raw.id,
    name: raw.customerName || raw.name || "",
    companyName: raw.companyName || "",
    location: raw.location || "",
    rating: Number(raw.rating) || 0,
    date: formatReviewDate(raw.createdAt),
    product: "",
    comment: raw.review || "",
    sellerResponse: raw.adminReply || raw.sellerResponse || "",
  };
}

export function getRatingSummary(reviews) {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
      total
    : 0;

  const counts = reviews.reduce((result, review) => {
    const rating = Number(review.rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      result[rating] += 1;
    }
    return result;
  }, [0, 0, 0, 0, 0, 0]);

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars];
    return {
      stars,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });

  const positiveCount = counts[4] + counts[5];
  const fiveStarCount = counts[5];

  return {
    total,
    average,
    breakdown,
    positivePercent: total ? Math.round((positiveCount / total) * 100) : 0,
    fiveStarPercent: total ? Math.round((fiveStarCount / total) * 100) : 0,
  };
}

export function getRatingHighlights(summary) {
  return [
    {
      label: "Average Rating",
      value: (summary.average / 5) * 100,
      displayValue: `${summary.average.toFixed(1)}/5`,
    },
    {
      label: "5-Star Reviews",
      value: summary.fiveStarPercent,
      displayValue: `${summary.fiveStarPercent}%`,
    },
    {
      label: "4+ Star Reviews",
      value: summary.positivePercent,
      displayValue: `${summary.positivePercent}%`,
    },
  ];
}

export async function fetchApprovedReviews({ signal } = {}) {
  const response = await api.get("/reviews", { signal });

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message || "Unable to load approved reviews."
    );
  }

  return Array.isArray(response.data.reviews)
    ? response.data.reviews.filter((review) => review.status === "approved")
    : [];
}

export async function submitReview(values, { signal } = {}) {
  // `customerName` is the field stored by the API. Accept `name` as well so the
  // review form cannot break when it uses the shorter label.
  const customerName =
    values?.customerName !== undefined
      ? values.customerName
      : values?.name !== undefined
        ? values.name
        : "";

  const payload = {
    customerName: String(customerName || "").trim(),
    companyName: String(values?.companyName || "").trim(),
    location: String(values?.location || "").trim(),
    rating: Number(values?.rating),
    review: String(values?.review || "").trim(),
  };

  const response = await api.post("/reviews", payload, { signal });

  if (response.data?.success !== true) {
    throw new Error(
      response.data?.message ||
        "We could not submit your review right now. Please try again."
    );
  }

  return response.data;
}
