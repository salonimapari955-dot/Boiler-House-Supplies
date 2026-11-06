import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import CustomerReviewCard, { StarRating } from "./ReviewCard.jsx";
import {
  ArrowRightIcon,
  QuoteIcon,
  ShieldCheckIcon,
} from "./Icons.jsx";
import { useApprovedReviews } from "../hooks/useApprovedReviews.js";
import {
  getRatingHighlights,
  getRatingSummary,
  toDisplayReview,
} from "../lib/reviewApi.js";

function useMetricsInView() {
  const ref = useRef(null);
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return true;

    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    );
  });

  useEffect(() => {
    if (active) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  return [ref, active];
}

function SatisfactionRing({ label, value, displayValue, active, delay }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (active ? value / 100 : 0) * circumference;

  return (
    <div className="text-center">
      <div className="relative mx-auto h-20 w-20">
        <svg
          viewBox="0 0 80 80"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`${label}: ${displayValue}`}
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.13)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="text-brand-bright transition-[stroke-dashoffset] duration-[1200ms] ease-out"
            style={{ transitionDelay: `${delay}ms` }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-semibold text-white">
          {displayValue}
        </span>
      </div>
      <p className="mt-2.5 text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-slate-300">
        {label}
      </p>
    </div>
  );
}

export default function Reviews() {
  const [metricsRef, metricsActive] = useMetricsInView();
  const {
    reviews: approvedReviews,
    loading: reviewsLoading,
    error: reviewsError,
    reload: reloadReviews,
  } = useApprovedReviews();

  const displayReviews = approvedReviews.map(toDisplayReview);
  const summary = getRatingSummary(displayReviews);
  const homepageReviews = displayReviews.slice(0, 3);
  const overallRating = summary.average;
  const ratingBreakdown = summary.breakdown;
  const totalReviews = summary.total;
  const reviewHighlights = getRatingHighlights(summary);

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-[#fbfaf6] py-10 md:py-12"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10, 24, 38, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(10, 24, 38, 0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 72% 62% at 50% 0%, #000 0%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 62% at 50% 0%, #000 0%, transparent 82%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full border border-brand/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-16 hidden h-52 w-52 rotate-45 border border-ink/[0.04] lg:block"
        aria-hidden="true"
      />
      <QuoteIcon
        className="pointer-events-none absolute right-10 top-10 hidden h-40 w-40 text-ink/[0.025] lg:block"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
                <span className="h-px w-8 bg-brand" aria-hidden="true" />
                Ratings &amp; Reviews
              </p>

              <h2 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1] tracking-[0.02em] text-ink sm:text-5xl">
                Real ratings from
                <span className="block text-brand">Boiler House customers</span>
              </h2>
            </div>

            <Link
              to="/about/testimonials"
              className="group inline-flex shrink-0 items-center gap-2 self-start border border-line bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand hover:shadow-lg md:self-auto"
            >
              <ShieldCheckIcon className="h-4 w-4 text-brand" />
              All Testimonials
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div
          ref={metricsRef}
          className="mt-6 grid gap-5 lg:grid-cols-12 lg:items-stretch"
        >
          <Reveal className="h-full lg:col-span-7">
            <div className="relative h-full overflow-hidden border border-line bg-white p-6 shadow-[0_24px_60px_-48px_rgba(10,24,38,0.55)] sm:p-7">
              <span
                className="absolute left-0 top-0 h-1 w-24 bg-gradient-to-r from-brand to-brand-bright"
                aria-hidden="true"
              />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    Overall Rating
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="font-display text-6xl font-semibold leading-none tracking-[0.01em] text-ink">
                      {overallRating.toFixed(1)}
                    </span>
                    <span className="pb-1.5 text-sm font-semibold text-steel">
                      / 5
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <StarRating
                      rating={Math.round(overallRating)}
                      size="h-5 w-5"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-steel">
                    Based on{" "}
                    <span className="font-semibold text-ink">
                      {totalReviews} reviews
                    </span>.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-line pt-5">
                {ratingBreakdown.map((item, index) => (
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
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright transition-[width] duration-[1100ms] ease-out"
                        style={{
                          width: metricsActive ? `${item.percent}%` : "0%",
                          transitionDelay: `${index * 80}ms`,
                        }}
                      />
                    </div>

                    <span className="text-right text-xs font-semibold text-steel">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="h-full lg:col-span-5">
            <div className="relative flex h-full flex-col overflow-hidden border border-ink bg-ink p-6 text-white shadow-[0_28px_60px_-40px_rgba(10,24,38,0.75)] sm:p-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.055) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/15 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bright">
                  <span className="h-px w-5 bg-brand-bright" aria-hidden="true" />
                  Approved Reviews
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold uppercase leading-tight tracking-[0.04em] text-white">
                  Review ratings
                  <span className="block text-brand-bright">at a glance</span>
                </h3>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {reviewHighlights.map((stat, index) => (
                    <SatisfactionRing
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                      displayValue={stat.displayValue}
                      active={metricsActive}
                      delay={index * 120}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-8">
          <Reveal>
            <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                  Customer Reviews
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  What buyers say
                </h3>
              </div>
              <p className="text-xs font-medium text-steel" aria-live="polite">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {homepageReviews.length}
                </span>{" "}
                of {totalReviews} reviews
              </p>
            </div>
          </Reveal>

          {reviewsLoading ? (
            <div
              role="status"
              className="mt-5 flex items-center gap-2 border border-line bg-white px-4 py-6 text-xs font-medium text-steel"
            >
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
                aria-hidden="true"
              />
              Loading approved reviews...
            </div>
          ) : reviewsError ? (
            <div
              role="alert"
              className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-[#a33a2d]/25 bg-[#a33a2d]/5 px-4 py-3 text-xs leading-6 text-[#a33a2d]"
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
          ) : homepageReviews.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {homepageReviews.map((review, index) => (
                <Reveal
                  key={review.id}
                  delay={index * 70}
                  className="h-full min-w-0"
                >
                  <CustomerReviewCard review={review} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-dashed border-line bg-white px-6 py-10 text-center">
              <p className="font-display text-xl font-semibold uppercase tracking-[0.04em] text-ink">
                No approved reviews yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-steel">
                Approved customer reviews will appear here.
              </p>
            </div>
          )}

          <Reveal>
            <div className="mt-6 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
             

              <Link
                to="/about/testimonials"
                className="btn-primary shrink-0 self-start sm:self-auto"
              >
                View More Reviews
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
