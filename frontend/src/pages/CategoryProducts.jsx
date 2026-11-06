import { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import CategorySidebar from "../components/CategorySidebar.jsx";
import ProductShowcase, {
  ProductShowcaseSkeleton,
} from "../components/ProductShowcase.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProducts } from "../hooks/useProducts.js";
import {
  countProductsByCategory,
  productMatchesCategory,
} from "../lib/productCatalog.js";
import { ArrowRightIcon, PackageIcon } from "../components/Icons.jsx";

function EmptyCategoryState({ categoryName }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center border border-[#E2E5E8] bg-white px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center bg-[#F3F4F5] text-[#C7460D]">
        <PackageIcon className="h-8 w-8" />
      </span>

      <h2 className="mt-6 max-w-xl font-sans text-2xl font-bold leading-[1.15] tracking-[-0.01em] text-[#2D3239] sm:text-3xl">
        No products available in {categoryName || "this category"} yet.
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-7 text-[#5B6B7C]">
        Products added to this category in the admin panel will appear here
        automatically. Our team can also help you source a specific item.
      </p>

      <Link
        to="/#contact"
        className="mt-7 inline-flex items-center justify-center gap-2 bg-[#C7460D] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#A93A0A]"
      >
        Contact Our Team
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ErrorCategoryState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex min-h-[320px] flex-col items-center justify-center border border-[#E2E5E8] bg-white px-6 py-14 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center bg-[#F3F4F5] text-[#C7460D]">
        <PackageIcon className="h-8 w-8" />
      </span>

      <h2 className="mt-6 max-w-xl font-sans text-2xl font-bold leading-[1.15] tracking-[-0.01em] text-[#2D3239] sm:text-3xl">
        Products are temporarily unavailable.
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-7 text-[#5B6B7C]">
        {message ||
          "We could not load this category right now. Please try again."}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 bg-[#C7460D] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#A93A0A]"
        >
          Try Again
        </button>
        <Link
          to="/#contact"
          className="inline-flex items-center justify-center gap-2 bg-[#2D3239] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1F2328]"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
}

export default function CategoryProducts({
  category,
  categories = [],
  categoriesLoading = false,
  categoriesError = "",
  onRetryCategories,
}) {
  const { products, loading, error, reload } = useProducts();
  const navigate = useNavigate();

  const categoryProducts = useMemo(
    () =>
      products.filter((product) => productMatchesCategory(product, category)),
    [products, category],
  );

  const productsByCategory = useMemo(() => {
    const grouped = {};

    categories.forEach((entry) => {
      grouped[entry.slug] = products.filter((product) =>
        productMatchesCategory(product, entry),
      );
    });

    return grouped;
  }, [categories, products]);

  const counts = useMemo(
    () => countProductsByCategory(products, categories),
    [products, categories],
  );

  const scrollToProduct = useCallback((product) => {
    if (!product?.slug) return;

    const node = document.getElementById(`product-${product.slug}`);
    if (!node) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    node.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const handleProductSelect = useCallback(
    (categorySlug, product) => {
      if (categorySlug && categorySlug !== category.slug) {
        navigate(`/products/${categorySlug}`);
        return;
      }

      // Wait for React to finish the current paint before scrolling to the
      // selected product block.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => scrollToProduct(product));
      });
    },
    [category.slug, navigate, scrollToProduct],
  );

  const categoryHeader = (
    <header className="relative overflow-hidden rounded-xl border border-[#E3E7EB] bg-white shadow-[0_12px_34px_-30px_rgba(10,24,38,0.5)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#C7460D] to-[#FB923C]" />
      <div className="px-4 py-3.5 pl-5 sm:px-6 sm:py-4 sm:pl-7">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#C7460D]">
          Product Category
        </p>
        <h1 className="mt-1 font-sans text-xl font-bold leading-tight tracking-[-0.025em] text-[#172635] sm:text-2xl lg:text-[1.75rem]">
          {category.name}
        </h1>
        <p className="mt-1.5 text-xs leading-5 text-[#5B6B7C] sm:text-[13px]">
          {category.description ||
            "Browse the products available in this category. Our team can confirm specifications, quantities and pricing on enquiry."}
        </p>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] font-sans text-[#2D3239]">
      <SiteHeader />

      <main>
        <div className="border-b border-[#E2E5E8] bg-white">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8694]"
            >
              <Link to="/" className="transition-colors hover:text-[#C7460D]">
                Home
              </Link>
              <span className="text-[#C6CBD1]">/</span>
              <Link
                to="/products"
                className="transition-colors hover:text-[#C7460D]"
              >
                Product Range
              </Link>
              <span className="text-[#C6CBD1]">/</span>
              <span className="max-w-[220px] truncate text-[#2D3239]">
                {category.name}
              </span>
            </nav>
          </div>
        </div>

        <section className="py-5 md:py-7">
          <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-5 md:mb-6">{categoryHeader}</div>

            <div className="grid items-start gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[290px_minmax(0,1fr)] xl:gap-7">
              <CategorySidebar
                categories={categories}
                counts={counts}
                activeSlug={category.slug}
                loading={categoriesLoading}
                error={categoriesError}
                onRetry={onRetryCategories}
                productsByCategory={productsByCategory}
                onProductSelect={handleProductSelect}
                categoryPageStyle
              />

              <div
                key={category.slug}
                className="category-content-enter min-w-0"
              >
                <div className="mt-5 space-y-5 md:space-y-6">
                  {loading ? (
                    [0, 1].map((index) => (
                      <ProductShowcaseSkeleton key={index} />
                    ))
                  ) : error ? (
                    <ErrorCategoryState message={error} onRetry={reload} />
                  ) : categoryProducts.length > 0 ? (
                    categoryProducts.map((product, index) => (
                      <Reveal
                        key={product.slug || product.id}
                        variant="fade"
                        delay={(index % 3) * 50}
                      >
                        <ProductShowcase
                          product={product}
                          products={categoryProducts}
                          stickyMedia
                        />
                      </Reveal>
                    ))
                  ) : (
                    <EmptyCategoryState categoryName={category.name} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SiteFooter />
    </div>
  );
}
