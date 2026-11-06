import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories.js";
import { pickFeaturedCategories } from "../lib/productCatalog.js";
import CategoryCard from "./CategoryCard.jsx";
import Reveal from "./Reveal.jsx";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  PackageIcon,
} from "./Icons.jsx";

function CategoryCardSkeleton() {
  return (
    <div className="border border-line bg-white">
      <div className="aspect-square w-full animate-pulse bg-paper-deep" />
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="h-5 w-3/4 animate-pulse bg-paper-deep" />
        <div className="mt-2 h-5 w-1/2 animate-pulse bg-paper-deep" />
        <div className="mt-5 h-3 w-28 animate-pulse bg-paper-deep" />
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const {
    categories,
    loading,
    error,
    reload: reloadCategories,
  } = useCategories();

  const featuredCategories = pickFeaturedCategories(categories);
  const loadFailed = Boolean(error);

  return (
    <section id="featured" className="relative scroll-mt-24 bg-paper py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
              <span className="h-px w-8 bg-brand" />
              Featured Categories
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] text-ink sm:text-5xl">
              Explore our
              <span className="text-brand"> product categories</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-steel sm:text-base">
              A focused look at the categories chosen by our team. Browse each
              category to see its full product range.
            </p>
          </div>
        </Reveal>

        <div className="mt-7">
          {loading && categories.length === 0 && (
            <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <CategoryCardSkeleton key={item} />
              ))}
            </div>
          )}

          {!loading && loadFailed && (
            <Reveal>
              <div className="border border-line bg-white px-6 py-14 text-center">
                <PackageIcon className="mx-auto h-10 w-10 text-brand" />
                <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  Featured categories are temporarily unavailable
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                  We could not load the featured categories right now. Please
                  try again, or contact our team for current availability.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={reloadCategories}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                  <Link to="/#contact" className="btn-dark">
                    Contact Us
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {!loading && !loadFailed && featuredCategories.length === 0 && (
            <Reveal>
              <div className="border border-dashed border-line bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center border border-line bg-paper text-brand">
                  <PackageIcon className="h-8 w-8" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  Featured categories are being updated
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                  Our team is refreshing the home page selection. Browse the full
                  catalogue or contact us for current specifications and
                  availability.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/#contact" className="btn-primary">
                    Request a Product
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link to="/products" className="btn-dark">
                    View All Categories
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {!loading && !loadFailed && featuredCategories.length > 0 && (
            <div className="grid gap-5 md:grid-cols-3">
              {featuredCategories.map((category, index) => (
                <Reveal
                  key={category.id || category.slug}
                  delay={index * 90}
                  className="h-full"
                >
                  <CategoryCard category={category} variant="compact" />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-col items-center gap-4 border-t border-line pt-6 text-center">
            <Link to="/products" className="btn-dark group">
              Explore All Categories
              <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs leading-6 text-steel">
              Browse the complete product range and enquire directly for
              specifications or pricing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
