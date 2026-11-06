import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import CategorySidebar from "./components/CategorySidebar.jsx";
import ProductShowcase, {
  ProductShowcaseHeader,
  ProductShowcaseSkeleton,
} from "./components/ProductShowcase.jsx";
import { useCategories } from "./hooks/useCategories.js";
import { useProducts } from "./hooks/useProducts.js";
import {
  countProductsByCategory,
  makeSlug,
  productMatchesCategory,
} from "./lib/productCatalog.js";
import { getCategoryBySlug } from "./data/categories.js";
import CategoryProducts from "./pages/CategoryProducts.jsx";
import {
  ArrowRightIcon,
  PackageIcon,
} from "./components/Icons.jsx";

function ProductLoading() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-4 sm:px-6 md:py-5 lg:px-8">
      <div className="mb-5">
        <div className="h-[41px] w-full animate-pulse bg-[#f8f8f8]" />
        <div className="mt-2 h-6 w-full animate-pulse bg-[#f0f0f0]" />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-[300px_minmax(0,1fr)] md:gap-4 lg:gap-5 xl:gap-6">
        <div className="hidden overflow-hidden rounded-sm border border-[#E2E5E8] bg-[#F3F4F5] md:block">
          <div className="h-9 animate-pulse border-b border-[#E2E5E8] bg-[#ECEEF0]" />
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="h-9 animate-pulse border-b border-[#E2E5E8] bg-white/70"
            />
          ))}
        </div>

        <div className="min-w-0">
          <ProductShowcaseSkeleton showHeader={false} />
        </div>
      </div>
    </div>
  );
}

function CatalogRouteLoading() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#2D3239]">
      <SiteHeader />
      <main>
        <ProductLoading />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories();

  const staticCategory = getCategoryBySlug(slug);
  const dynamicCategory = categories.find((item) => item.slug === slug);
  // Once MongoDB categories have loaded successfully, they are the source of
  // truth. The static catalogue is only a fallback when the API is unavailable,
  // so a deleted category cannot keep appearing through a direct URL.
  const category =
    dynamicCategory || (categoriesError ? staticCategory : null);

  // Category slugs open the category product view (sidebar + listing).
  // Every other slug keeps the existing individual product detail page.
  if (category) {
    return (
      <CategoryProducts
        category={category}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onRetryCategories={reloadCategories}
      />
    );
  }

  // Wait for MongoDB categories before deciding that this is a product slug.
  if (categoriesLoading) {
    return <CatalogRouteLoading />;
  }

  return (
    <CatalogProductDetail
      slug={slug}
      categories={categories}
      categoriesError={categoriesError}
      onRetryCategories={reloadCategories}
    />
  );
}

function CatalogProductDetail({
  slug,
  categories = [],
  categoriesError = "",
  onRetryCategories,
}) {
  const { products, loading, error, warning, reload } = useProducts();
  const navigate = useNavigate();

  const product = products.find(
    (item) => item.slug === slug || makeSlug(item.name) === slug,
  );

  const activeCategory = useMemo(() => {
    if (!product) return null;
    return (
      categories.find((item) => productMatchesCategory(product, item)) || null
    );
  }, [categories, product]);

  const productsByCategory = useMemo(() => {
    const grouped = {};

    categories.forEach((item) => {
      grouped[item.slug] = products.filter((entry) =>
        productMatchesCategory(entry, item),
      );
    });

    return grouped;
  }, [categories, products]);

  const counts = useMemo(
    () => countProductsByCategory(products, categories),
    [products, categories],
  );
  const matchingCategoryProducts = activeCategory
    ? productsByCategory[activeCategory.slug]
    : null;
  const activeCategoryProducts =
    matchingCategoryProducts?.length > 0
      ? matchingCategoryProducts
      : [product];

  const loadFailed = Boolean(error || (warning && products.length === 0));

  return (
    <div className="min-h-screen bg-white font-sans text-[#2D3239]">
      <SiteHeader />

      <main>
        <div className="border-b border-[#E2E5E8] bg-white">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-2.5 sm:px-6 lg:px-8">
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
              {activeCategory ? (
                <>
                  <span className="text-[#C6CBD1]">/</span>
                  <Link
                    to={`/products/${activeCategory.slug}`}
                    className="max-w-[180px] truncate transition-colors hover:text-[#C7460D]"
                  >
                    {activeCategory.name}
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        </div>

        {loading && <ProductLoading />}

        {!loading && loadFailed && (
          <section className="mx-auto w-full max-w-3xl px-5 py-20 text-center md:py-24">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-[#F3F4F5] text-[#C7460D]">
              <PackageIcon className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-sans text-3xl font-bold tracking-[-0.02em] text-[#2D3239] sm:text-4xl">
              Catalogue temporarily unavailable
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5B6B7C]">
              We could not load this product right now. Please try again, or
              contact our team for current specifications and availability.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center justify-center gap-2 bg-[#C7460D] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#A93A0A]"
              >
                Try Again
              </button>
              <Link
                to="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-[#2D3239] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1F2328]"
              >
                Contact Us
              </Link>
            </div>
          </section>
        )}

        {!loading && !loadFailed && !product && (
          <section className="mx-auto w-full max-w-3xl px-5 py-20 text-center md:py-24">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-[#F3F4F5] text-[#C7460D]">
              <PackageIcon className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-sans text-3xl font-bold tracking-[-0.02em] text-[#2D3239] sm:text-4xl">
              Product not found
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#5B6B7C]">
              This product may have been moved or removed from the catalogue.
              Browse the full product range or contact our team for help.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#C7460D] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#A93A0A]"
              >
                View All Products
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/#contact"
                className="inline-flex items-center justify-center gap-2 bg-[#2D3239] px-5 py-3 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#1F2328]"
              >
                Contact Us
              </Link>
            </div>
          </section>
        )}

        {!loading && !loadFailed && product && (
          <section className="py-4 md:py-5">
            <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
              <div className="mb-5">
                <ProductShowcaseHeader
                  product={product}
                  products={activeCategoryProducts}
                  headingLevel="h1"
                />
              </div>

              <div className="grid items-start gap-4 md:grid-cols-[270px_minmax(0,1fr)] md:gap-4 lg:gap-5 xl:gap-6">
                <CategorySidebar
                  key={activeCategory?.slug || "all"}
                  categories={categories}
                  counts={counts}
                  activeSlug={activeCategory?.slug}
                  loading={false}
                  error={categoriesError}
                  onRetry={onRetryCategories}
                  productsByCategory={productsByCategory}
                  activeProductSlug={product.slug}
                  productDetailStyle
                  onProductSelect={(_categorySlug, nextProduct) =>
                    navigate(`/products/${nextProduct.slug}`)
                  }
                />

                <div className="min-w-0">
                  <ProductShowcase
                    key={product.id || product.slug}
                    product={product}
                    products={activeCategoryProducts}
                    showHeader={false}
                    stickyMedia
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
