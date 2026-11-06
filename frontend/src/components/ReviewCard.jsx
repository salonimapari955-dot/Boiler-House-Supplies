import {
  ArrowUpRightIcon,
  CheckIcon,
  MapPinIcon,
  StarIcon,
} from "./Icons.jsx";
import { OFFICIAL_REVIEWS_URL } from "../data/reviews.js";

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function StarRating({
  rating,
  size = "h-4 w-4",
  emptyClassName = "text-ink/15",
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((star) => (
        <StarIcon
          key={star}
          filled={star < rating}
          className={`${size} ${star < rating ? "text-brand" : emptyClassName}`}
        />
      ))}
    </span>
  );
}

export default function CustomerReviewCard({
  review,
  showFullReview = false,
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_28px_55px_-34px_rgba(10,24,38,0.55)]">
      <span
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform duration-500 ease-out group-hover:scale-x-100"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-base font-semibold uppercase tracking-[0.04em] text-white ring-1 ring-ink/10 transition-colors duration-300 group-hover:bg-brand">
            {getInitials(review.name)}
          </span>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold leading-6 text-ink">
              {review.name}
            </h4>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-5 text-steel">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="truncate">{review.location}</span>
            </p>
          </div>
        </div>

        <StarRating
          rating={review.rating}
          size="h-3.5 w-3.5"
          emptyClassName="text-ink/15"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {review.product ? (
          <span className="max-w-full border border-line bg-paper px-2.5 py-1 text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-ink">
            {review.product}
          </span>
        ) : null}
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-steel">
          {review.date}
        </span>
      </div>

      {review.comment ? (
        <div className="mt-4 flex-1">
          <blockquote className="whitespace-pre-line border-l-2 border-brand/30 pl-3 text-sm leading-7 text-steel">
            {review.comment}
            {!showFullReview && review.commentIsExcerpt ? "…" : ""}
          </blockquote>
          {!showFullReview && review.commentIsExcerpt ? (
            <a
              href={OFFICIAL_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand transition-colors duration-200 hover:text-ink"
            >
              Read on official page
              <ArrowUpRightIcon className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 flex-1 text-[11px] leading-6 text-steel/75">
          Rating published without a written comment.
        </p>
      )}

      {review.sellerResponse ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
            <CheckIcon className="h-3.5 w-3.5" />
            Response from Boiler House Supplies
          </p>
          <p className="mt-1 text-xs leading-6 text-steel">
            {review.sellerResponse}
          </p>
        </div>
      ) : null}
    </article>
  );
}
