import Reveal from "./Reveal.jsx";
import {
  ArrowUpRightIcon,
  QuoteIcon,
  ShieldCheckIcon,
  StarIcon,
} from "./Icons.jsx";

const reviewCriteria = [
  "Product quality",
  "Specification accuracy",
  "Dispatch & delivery",
  "Enquiry support",
];

const reviewMailto =
  "mailto:info@boilerhouse.in?subject=" +
  encodeURIComponent("Customer review for Boiler House Supplies") +
  "&body=" +
  encodeURIComponent(
    "Hello Boiler House Supplies team,\n\nI would like to share a review.\n\nName:\nCompany:\nProduct / order reference:\nRating (1-5):\nReview:\n\nThank you.",
  );

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-white md:py-28"
    >
      <div className="industrial-grid absolute inset-0 opacity-70" />
      <div className="absolute -right-24 top-4 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-bright">
              <span className="h-px w-8 bg-brand-bright" />
              Ratings &amp; Customer Reviews
            </p>

            <h2 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] sm:text-5xl">
              Real feedback.
              <span className="block text-brand-bright">
                Published only when verified.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              We do not display placeholder testimonials or invented ratings.
              Verified customer feedback will appear here as it is collected
              and approved by our team.
            </p>

            <div className="mt-8 flex flex-col gap-5 border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-1.5 text-brand-bright">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <StarIcon key={star} className="h-5 w-5" />
                  ))}
                </div>
                <p className="mt-3 font-display text-xl font-semibold uppercase tracking-[0.04em] text-white">
                  No verified reviews yet
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  Ratings will be shown only after a genuine review is received.
                </p>
              </div>
              <span className="shrink-0 border border-white/10 bg-ink/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Awaiting first review
              </span>
            </div>

            <a
              href={reviewMailto}
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-bright transition-colors duration-200 hover:text-white"
            >
              Share Your Experience
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-white/10 bg-white/[0.035] p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bright">
                    What customers rate
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-white">
                    Review criteria
                  </h3>
                </div>
                <QuoteIcon className="h-9 w-9 shrink-0 text-white/15" />
              </div>

              <div className="mt-7 grid gap-4">
                {reviewCriteria.map((criterion) => (
                  <div
                    key={criterion}
                    className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-slate-300">{criterion}</span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Not yet rated
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-start gap-3 border-t border-white/10 pt-5">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" />
                <p className="text-xs leading-6 text-slate-400">
                  Reviews are collected with customer consent and checked by
                  our team before publication. No rating is shown without a
                  matching review.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
