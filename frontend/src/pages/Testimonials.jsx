import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import Reveal from "../components/Reveal.jsx";
import CustomerReviewCard, { StarRating } from "../components/ReviewCard.jsx";
import {
  ArrowRightIcon,
  CheckIcon,
  QuoteIcon,
  SendIcon,
  StarIcon,
} from "../components/Icons.jsx";
import { useApprovedReviews } from "../hooks/useApprovedReviews.js";
import {
  getRatingHighlights,
  getRatingSummary,
  submitReview,
  toDisplayReview,
} from "../lib/reviewApi.js";

const initialReviewValues = {
  customerName: "",
  companyName: "",
  location: "",
  rating: 0,
  review: "",
};

const REVIEW_FIELD_CLASS = "field rounded-md bg-white";

const REVIEW_FIELD_ERROR_CLASS =
  "border-[#a33a2d] focus:border-[#a33a2d] focus:shadow-[0_0_0_3px_rgba(163,58,45,0.12)]";

function validateReview(values) {
  const errors = {};

  const customerName = values.customerName.trim();
  if (!customerName) {
    errors.customerName = "Please enter your name.";
  } else if (customerName.length < 2) {
    errors.customerName = "Please enter at least 2 characters.";
  } else if (customerName.length > 120) {
    errors.customerName = "Name cannot exceed 120 characters.";
  }

  if (values.companyName.trim().length > 160) {
    errors.companyName = "Company name cannot exceed 160 characters.";
  }

  const location = values.location.trim();
  if (!location) {
    errors.location = "Please enter your location.";
  } else if (location.length < 2) {
    errors.location = "Please enter at least 2 characters.";
  } else if (location.length > 160) {
    errors.location = "Location cannot exceed 160 characters.";
  }

  const rating = Number(values.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Please select a rating from 1 to 5 stars.";
  }

  const review = values.review.trim();
  if (!review) {
    errors.review = "Please write your review.";
  } else if (review.length < 10) {
    errors.review =
      "Please add a little more detail (at least 10 characters).";
  } else if (review.length > 2000) {
    errors.review = "Review cannot exceed 2000 characters.";
  }

  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs leading-5 text-[#a33a2d]">
      {message}
    </p>
  );
}

export default function Testimonials() {
  const {
    reviews: approvedReviews,
    loading: reviewsLoading,
    error: reviewsError,
    reload: reloadReviews,
  } = useApprovedReviews();

  const [values, setValues] = useState(initialReviewValues);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: "idle",
    message: "",
  });

  const errors = validateReview(values);
  const isFieldError = (field) =>
    Boolean((attempted || touched[field]) && errors[field]);

  const approvedDisplayReviews = approvedReviews.map(toDisplayReview);
  const displayReviews = approvedDisplayReviews;
  const summary = getRatingSummary(displayReviews);
  const shownOverallRating = summary.average;
  const shownRatingBreakdown = summary.breakdown;
  const reviewHighlights = getRatingHighlights(summary);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));

    if (submitStatus.type !== "idle") {
      setSubmitStatus({ type: "idle", message: "" });
    }
  }

  function handleChange(event) {
    setField(event.target.name, event.target.value);
  }

  function handleBlur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    setTouched({
      customerName: true,
      companyName: true,
      location: true,
      rating: true,
      review: true,
    });

    const currentErrors = validateReview(values);
    const firstInvalid = [
      "customerName",
      "companyName",
      "location",
      "rating",
      "review",
    ].find((field) => currentErrors[field]);

    if (firstInvalid) {
      const elementId =
        firstInvalid === "rating"
          ? "review-rating-1"
          : `review-${firstInvalid}`;
      document.getElementById(elementId)?.focus();
      setSubmitStatus({ type: "idle", message: "" });
      return;
    }

    setSubmitting(true);
    setSubmitStatus({ type: "idle", message: "" });

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const result = await submitReview(
        {
          customerName: values.customerName.trim(),
          companyName: values.companyName.trim(),
          location: values.location.trim(),
          rating: Number(values.rating),
          review: values.review.trim(),
        },
        { signal: controller.signal },
      );

      setSubmitStatus({
        type: "success",
        message:
          result.message ||
          "Thank you. Your review has been submitted and is awaiting approval.",
      });
      setValues(initialReviewValues);
      setTouched({});
      setAttempted(false);
      reloadReviews();
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          (error.name === "CanceledError"
            ? "The request timed out. Please try again."
            : error.message ||
              "We could not submit your review right now. Please try again."),
      });
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-ink py-12 text-white md:py-16">
          <div className="industrial-grid absolute inset-0 opacity-70" />
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
          <QuoteIcon
            className="pointer-events-none absolute right-8 top-10 hidden h-48 w-48 text-white/[0.035] lg:block"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
            >
              <Link
                to="/"
                className="transition-colors duration-200 hover:text-brand-bright"
              >
                Home
              </Link>
              <span className="text-white/25">/</span>
              <Link
                to="/#about"
                className="transition-colors duration-200 hover:text-brand-bright"
              >
                About Us
              </Link>
              <span className="text-white/25">/</span>
              <span className="text-slate-200">Testimonials</span>
            </nav>

            <p className="mt-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-bright">
              <span className="h-px w-8 bg-brand-bright" />
              Customer Testimonials
            </p>

            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold uppercase leading-[0.96] tracking-[0.02em] sm:text-5xl lg:text-6xl">
              What our customers
              <span className="block text-brand-bright">say about us</span>
            </h1>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {summary.total} verified reviews
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-paper py-8 md:py-11">
          <div className="mx-auto max-w-7xl px-5">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="border border-line bg-white p-5 shadow-[0_24px_60px_-48px_rgba(10,24,38,0.55)] sm:p-6 lg:col-span-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                        Overall Rating
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="font-display text-6xl font-semibold leading-none tracking-[0.01em] text-ink">
                          {shownOverallRating.toFixed(1)}
                        </span>
                        <span className="pb-1.5 text-sm font-semibold text-steel">
                          / 5
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <StarRating
                          rating={Math.round(shownOverallRating)}
                          size="h-5 w-5"
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-steel">
                        Based on{" "}
                        <span className="font-semibold text-ink">
                          {summary.total} reviews
                        </span>
                        .
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-line pt-4">
                    {shownRatingBreakdown.map((item) => (
                      <div
                        key={item.stars}
                        className="grid grid-cols-[3.4rem_1fr_2.6rem] items-center gap-3"
                      >
                        <span className="text-xs font-semibold text-ink">
                          {item.stars} star
                        </span>

                        <div
                          className="h-2.5 overflow-hidden rounded-full bg-ink/10"
                          role="progressbar"
                          aria-label={`${item.stars} star reviews`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={item.percent}
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>

                        <span className="text-right text-xs font-semibold text-steel">
                          {item.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-ink bg-ink p-5 text-white sm:p-6 lg:col-span-5">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bright">
                    <span className="h-px w-5 bg-brand-bright" aria-hidden="true" />
                    Approved Reviews
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-tight tracking-[0.04em] text-white">
                    Review ratings
                    <span className="block text-brand-bright">at a glance</span>
                  </h2>

                  <dl className="mt-5 grid grid-cols-3 gap-2">
                    {reviewHighlights.map((stat) => (
                      <div
                        key={stat.label}
                        className="border border-white/10 bg-white/[0.04] px-2 py-4 text-center"
                      >
                        <dt className="text-[9px] font-bold uppercase leading-4 tracking-[0.1em] text-slate-300">
                          {stat.label}
                        </dt>
                        <dd className="mt-1 font-display text-2xl font-semibold text-white">
                          {stat.displayValue}
                        </dd>
                      </div>
                    ))}
                  </dl>

                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="write-review"
          className="border-b border-line bg-paper-deep/40 py-10 md:py-14"
        >
          <div className="mx-auto max-w-7xl px-5">
            <Reveal>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
                    <span className="h-px w-8 bg-brand" />
                    Share Your Experience
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold uppercase leading-tight tracking-[0.04em] text-ink sm:text-4xl">
                    Write a <span className="text-brand">review</span>
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-steel">
                    Worked with Boiler House Supplies? Tell us about your
                    experience. Every review is checked by our team before it
                    appears on this page.
                  </p>

                  <ul className="mt-5 space-y-2 text-xs leading-6 text-steel">
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
                      Your name and location are shown with your review.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
                      Company name is optional.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-brand" />
                      Reviews are published after admin approval.
                    </li>
                  </ul>
                </div>

                <div className="border border-line bg-white p-5 shadow-[0_24px_60px_-48px_rgba(10,24,38,0.55)] sm:p-6 lg:col-span-7">
                  <form
                    noValidate
                    onSubmit={handleSubmit}
                    className="grid gap-4"
                  >
                    {submitStatus.type !== "idle" ? (
                      <div
                        role={
                          submitStatus.type === "error" ? "alert" : "status"
                        }
                        className={`border px-4 py-3 text-xs leading-6 ${
                          submitStatus.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-[#a33a2d]/25 bg-[#a33a2d]/5 text-[#a33a2d]"
                        }`}
                      >
                        {submitStatus.message}
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="review-customerName"
                          className="field-label"
                        >
                          Your Name <span className="text-brand">*</span>
                        </label>
                        <input
                          id="review-customerName"
                          name="customerName"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={120}
                          value={values.customerName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={isFieldError("customerName")}
                          aria-describedby={
                            isFieldError("customerName")
                              ? "review-customerName-error"
                              : undefined
                          }
                          className={`${REVIEW_FIELD_CLASS} ${
                            isFieldError("customerName")
                              ? REVIEW_FIELD_ERROR_CLASS
                              : ""
                          }`}
                          placeholder="Your full name"
                        />
                        <FieldError
                          id="review-customerName-error"
                          message={
                            isFieldError("customerName")
                              ? errors.customerName
                              : ""
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="review-companyName"
                          className="field-label"
                        >
                          Company Name{" "}
                          <span className="text-steel/60">(optional)</span>
                        </label>
                        <input
                          id="review-companyName"
                          name="companyName"
                          type="text"
                          autoComplete="organization"
                          maxLength={160}
                          value={values.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={isFieldError("companyName")}
                          aria-describedby={
                            isFieldError("companyName")
                              ? "review-companyName-error"
                              : undefined
                          }
                          className={`${REVIEW_FIELD_CLASS} ${
                            isFieldError("companyName")
                              ? REVIEW_FIELD_ERROR_CLASS
                              : ""
                          }`}
                          placeholder="Company name"
                        />
                        <FieldError
                          id="review-companyName-error"
                          message={
                            isFieldError("companyName")
                              ? errors.companyName
                              : ""
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="review-location" className="field-label">
                        Location <span className="text-brand">*</span>
                      </label>
                      <input
                        id="review-location"
                        name="location"
                        type="text"
                        autoComplete="address-level2"
                        required
                        maxLength={160}
                        value={values.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={isFieldError("location")}
                        aria-describedby={
                          isFieldError("location")
                            ? "review-location-error"
                            : undefined
                        }
                        className={`${REVIEW_FIELD_CLASS} ${
                          isFieldError("location")
                            ? REVIEW_FIELD_ERROR_CLASS
                            : ""
                        }`}
                        placeholder="City, State"
                      />
                      <FieldError
                        id="review-location-error"
                        message={
                          isFieldError("location") ? errors.location : ""
                        }
                      />
                    </div>

                    <div>
                      <span className="field-label" id="review-rating-label">
                        Your Rating <span className="text-brand">*</span>
                      </span>
                      <div
                        role="radiogroup"
                        aria-labelledby="review-rating-label"
                        aria-invalid={isFieldError("rating")}
                        aria-describedby={
                          isFieldError("rating")
                            ? "review-rating-error"
                            : undefined
                        }
                        className="flex flex-wrap items-center gap-1.5"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            id={`review-rating-${value}`}
                            type="button"
                            role="radio"
                            aria-checked={Number(values.rating) === value}
                            aria-label={`${value} star${
                              value === 1 ? "" : "s"
                            }`}
                            onClick={() => {
                              setField("rating", value);
                              setTouched((current) => ({
                                ...current,
                                rating: true,
                              }));
                            }}
                            className="rounded-sm p-1 text-ink/20 transition-colors duration-200 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                          >
                            <StarIcon
                              filled={value <= Number(values.rating)}
                              className={`h-7 w-7 ${
                                value <= Number(values.rating)
                                  ? "text-brand"
                                  : "text-ink/20"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-medium text-steel">
                          {Number(values.rating)
                            ? `${values.rating} of 5`
                            : "Select a rating"}
                        </span>
                      </div>
                      <FieldError
                        id="review-rating-error"
                        message={isFieldError("rating") ? errors.rating : ""}
                      />
                    </div>

                    <div>
                      <label htmlFor="review-review" className="field-label">
                        Your Review <span className="text-brand">*</span>
                      </label>
                      <textarea
                        id="review-review"
                        name="review"
                        rows={5}
                        required
                        maxLength={2000}
                        value={values.review}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={isFieldError("review")}
                        aria-describedby={
                          isFieldError("review") ? "review-review-error" : undefined
                        }
                        className={`${REVIEW_FIELD_CLASS} resize-y ${
                          isFieldError("review") ? REVIEW_FIELD_ERROR_CLASS : ""
                        }`}
                        placeholder="Tell us about the products, service and support you received."
                      />
                      <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
                        <FieldError
                          id="review-review-error"
                          message={isFieldError("review") ? errors.review : ""}
                        />
                        <span className="ml-auto text-[10px] font-medium text-steel">
                          {values.review.trim().length}/2000
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <span
                              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                              aria-hidden="true"
                            />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Review
                            <SendIcon className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <p className="text-[11px] leading-5 text-steel">
                        Your review will appear after approval.
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-5">
            <Reveal>
              <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    All Reviews
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-4xl">
                    Customer feedback
                  </h2>
                </div>
                <p className="text-xs font-medium text-steel">
                  <span className="font-semibold text-ink">
                    {displayReviews.length}
                  </span>{" "}
                  reviews shown
                </p>
              </div>
            </Reveal>

            {reviewsLoading ? (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 text-xs font-medium text-steel"
              >
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
                  aria-hidden="true"
                />
                Loading approved reviews...
              </div>
            ) : null}

            {reviewsError ? (
              <div
                role="alert"
                className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-[#a33a2d]/25 bg-[#a33a2d]/5 px-4 py-3 text-xs leading-6 text-[#a33a2d]"
              >
                <p>{reviewsError}</p>
                <button
                  type="button"
                  onClick={reloadReviews}
                  className="border border-[#a33a2d]/30 bg-white px-3 py-1.5 font-semibold transition-colors hover:bg-[#a33a2d]/5"
                >
                  Try again
                </button>
              </div>
            ) : null}

            {displayReviews.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayReviews.map((review, index) => (
                  <Reveal
                    key={review.id}
                    delay={(index % 3) * 70}
                    className="h-full min-w-0"
                  >
                    <CustomerReviewCard review={review} showFullReview />
                  </Reveal>
                ))}
              </div>
            ) : !reviewsLoading && !reviewsError ? (
              <div className="mt-5 border border-dashed border-line bg-white px-6 py-14 text-center">
                <p className="font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  No approved reviews yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-steel">
                  Be the first to share your experience with Boiler House
                  Supplies. Approved reviews appear here.
                </p>
              </div>
            ) : null}

            <Reveal>
              <div className="mt-7 flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Link to="/about/company-brief" className="btn-dark">
                    Company Brief
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link to="/" className="btn-primary">
                    Back to Home
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
