import { useMemo } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import BackToTopButton from "../components/BackToTopButton.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import Reveal from "../components/Reveal.jsx";
import { useCategories } from "../hooks/useCategories.js";
import { useProducts } from "../hooks/useProducts.js";
import { countProductsByCategory } from "../lib/productCatalog.js";
import { ArrowRightIcon, PackageIcon } from "../components/Icons.jsx";

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

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center border border-line bg-white px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center border border-line bg-paper-deep text-brand">
        <PackageIcon className="h-8 w-8" />
      </span>

      <h2 className="mt-6 max-w-xl font-display text-2xl font-semibold uppercase leading-[1.15] tracking-[0.03em] text-ink sm:text-3xl">
        No categories available yet.
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-7 text-steel">
        Categories added in the admin panel will appear here automatically. Our
        team can also help you source a specific item.
      </p>

      <Link to="/#contact" className="btn-primary mt-7">
        Contact Our Team
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-[320px] flex-col items-center justify-center border border-line bg-white px-6 py-14 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center border border-line bg-paper-deep text-brand">
        <PackageIcon className="h-8 w-8" />
      </span>

      <h2 className="mt-6 max-w-xl font-display text-2xl font-semibold uppercase leading-[1.15] tracking-[0.03em] text-ink sm:text-3xl">
        Categories are temporarily unavailable.
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-7 text-steel">
        {message ||
          "We could not load the category catalogue right now. Please try again."}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRetry} className="btn-primary">
          Try Again
        </button>
        <Link to="/#contact" className="btn-dark">
          Contact Our Team
        </Link>
      </div>
    </div>
  );
}

export default function Products() {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const counts = useMemo(
    () => countProductsByCategory(products, categories),
    [products, categories],
  );

  // Product counts are only shown once the live product API has answered, so
  // a loading or failed request never looks like an empty category.
  const showCounts = !productsLoading && !productsError;
  const totalProducts = products.length;

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <section className="border-b border-line bg-white">
          <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2.5 sm:px-6 lg:px-8 xl:px-10">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-steel"
            >
              <Link
                to="/"
                className="transition-colors duration-200 hover:text-brand"
              >
                Home
              </Link>
              <span className="text-line">/</span>
              <span className="text-ink">Products</span>
            </nav>

            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-steel sm:block">
              Industrial Boiler Components &amp; Supplies
            </p>
          </div>
        </section>

        <section className="category-video-banner relative flex h-[240px] items-start overflow-hidden bg-ink text-white sm:h-[320px] lg:h-[380px]">
          <video
            aria-hidden="true"
            className="category-background-video absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/boiler-hero.jpg"
          >
            <source src="/category-background.mp4" type="video/mp4" />
          </video>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20"
          />
          <div className="relative mx-auto w-full max-w-[1500px] px-5 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-14 xl:px-10">
            <h1 className="max-w-3xl font-sans text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              World-class boiler products and components
            </h1>
          </div>
        </section>

        <section className="relative z-10 mt-0 pb-10 md:-mt-20 md:pb-14">
          <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-6 lg:px-8 xl:px-10">
            <div>
              {categoriesLoading && categories.length === 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                    <CategoryCardSkeleton key={index} />
                  ))}
                </div>
              ) : categoriesError ? (
                <ErrorState
                  message={categoriesError}
                  onRetry={reloadCategories}
                />
              ) : categories.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
                  {categories.map((category, index) => (
                    <li key={category.slug}>
                      <Reveal className="h-full" delay={(index % 4) * 45}>
                        <CategoryCard
                          category={category}
                          variant="split"
                          count={
                            showCounts
                              ? (counts[category.slug] ?? 0)
                              : undefined
                          }
                        />
                      </Reveal>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BackToTopButton />
    </div>
  );
}
