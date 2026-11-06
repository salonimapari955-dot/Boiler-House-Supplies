import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDownIcon, PackageIcon } from "./Icons.jsx";

// The catalogue order requested for the product-range sidebar. Categories
// returned by the API are arranged to match it, while unknown categories stay
// at the end in their original order.
const CATEGORY_ORDER = [
  "grate-bar",
  "boiler-mountings",
  "grate-boiler",
  "boiler-fire-door",
  "refractory-cement",
  "steam-valves",
  "globe-valve",
  "fire-grate",
  "boiler-parts",
  "down-valve",
  "ceramic-fiber-blanket",
  "boiler-tubes",
  "boiler-castings",
  "check-valve",
  "magnetic-switches",
  "cleaning-brush",
];

function CountBadge({ count, active = false, onDark = false }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11.5px] font-semibold leading-none tabular-nums transition-colors duration-200 ${
        onDark
          ? active
            ? "bg-white/20 text-white"
            : "bg-white/10 text-white/70"
          : active
            ? "bg-[#C7460D] text-white"
            : "bg-[#F1F3F4] text-[#5B6B7C] group-hover:bg-white group-hover:text-[#C7460D]"
      }`}
    >
      {count}
    </span>
  );
}

/**
 * Category navigation for the product catalogue.
 *
 * Desktop: a white accordion card with every MongoDB category, live product
 * counts and expandable product lists. Mobile: a compact horizontal category
 * strip plus an expandable list for the selected category.
 */
export default function CategorySidebar({
  categories = [],
  counts = {},
  activeSlug,
  loading = false,
  error = "",
  onRetry,
  onSelect,
  showAll = false,
  allLabel = "All Products",
  totalCount,
  productsByCategory = null,
  onProductSelect,
  activeProductSlug,
  productDetailStyle = false,
}) {
  const activeMobileRef = useRef(null);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const orderedCategories = useMemo(() => {
    const rank = new Map(
      CATEGORY_ORDER.map((slug, index) => [slug, index]),
    );

    return [...categories].sort((a, b) => {
      const aRank = rank.has(a.slug) ? rank.get(a.slug) : Infinity;
      const bRank = rank.has(b.slug) ? rank.get(b.slug) : Infinity;

      return aRank - bRank;
    });
  }, [categories]);

  const isFilter = typeof onSelect === "function";
  const allActive = isFilter && !activeSlug;
  const allCount =
    totalCount ??
    orderedCategories.reduce(
      (sum, category) => sum + (counts?.[category.slug] ?? 0),
      0,
    );

  const firstCategoryWithProducts =
    orderedCategories.find(
      (category) => (productsByCategory?.[category.slug]?.length ?? 0) > 0,
    )?.slug || "";

  // Open the selected category by default, otherwise the first category that
  // actually has products. Once the customer interacts, their choice wins.
  const openSlug =
    expandedSlug === null
      ? activeSlug || firstCategoryWithProducts
      : expandedSlug;

  const activeCategory =
    orderedCategories.find((category) => category.slug === activeSlug) || null;
  const activeProducts = activeSlug
    ? productsByCategory?.[activeSlug] || []
    : [];

  // Keep the active chip visible inside the horizontally scrolling strip.
  // In filter mode the strip stays on the same page, so the page itself is
  // scrolled by the parent and this must not fight that scroll.
  useEffect(() => {
    if (isFilter) return;

    const node = activeMobileRef.current;
    if (!node) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    node.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSlug, isFilter]);

  function handleCategorySelect(slug) {
    setExpandedSlug(slug);
    setMobileListOpen(false);
    onSelect?.(slug);
  }

  function handleProductSelect(categorySlug, product) {
    setExpandedSlug(categorySlug);
    setMobileListOpen(false);

    if (onProductSelect) {
      onProductSelect(categorySlug, product);
    } else {
      onSelect?.(categorySlug);
    }
  }

  function toggleCategory(slug) {
    setExpandedSlug((current) => {
      const open = current === null ? openSlug : current;
      return open === slug ? "" : slug;
    });
  }

  return (
    <aside
      aria-label="Product categories"
      className="min-w-0 self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:[scrollbar-color:#CBD5E1_transparent] lg:[scrollbar-width:thin]"
    >
      {/* Mobile category strip */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-2xl border border-[#E2E5E8] bg-white shadow-[0_14px_34px_-28px_rgba(10,24,38,0.45)]">
          <div className="relative overflow-hidden bg-[#0A1826] px-4 py-3">
            <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#C7460D]/25 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-[#FB923C]">
                  <PackageIcon className="h-4 w-4" />
                </span>
                <p className="truncate text-[10.5px] font-bold uppercase tracking-[0.15em] text-white">
                  Product Range
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80">
                {allCount} Items
              </span>
            </div>
          </div>

          <nav
            aria-label="Categories"
            className="category-strip flex snap-x gap-2 overflow-x-auto px-3 py-3"
          >
            {loading && orderedCategories.length === 0 ? (
              [0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-[#F1F3F4]"
                />
              ))
            ) : (
              <>
                {isFilter && showAll ? (
                  <button
                    type="button"
                    ref={allActive ? activeMobileRef : undefined}
                    onClick={() => handleCategorySelect("")}
                    aria-pressed={allActive}
                    className={`group flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
                      allActive
                        ? "border-[#C7460D] bg-[#C7460D] text-white shadow-[0_8px_18px_-10px_rgba(199,70,13,0.9)]"
                        : "border-[#E2E5E8] bg-white text-[#4B5563] hover:border-[#C7460D]/40 hover:bg-[#FFF4ED] hover:text-[#C7460D]"
                    }`}
                  >
                    <span>{allLabel}</span>
                    <CountBadge
                      count={allCount}
                      active={allActive}
                      onDark={allActive}
                    />
                  </button>
                ) : null}

                {orderedCategories.map((category) => {
                  const active = category.slug === activeSlug;
                  const count = counts?.[category.slug] ?? 0;
                  const className = `group flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 ${
                    active
                      ? "border-[#C7460D] bg-[#C7460D] text-white shadow-[0_8px_18px_-10px_rgba(199,70,13,0.9)]"
                      : "border-[#E2E5E8] bg-white text-[#4B5563] hover:border-[#C7460D]/40 hover:bg-[#FFF4ED] hover:text-[#C7460D]"
                  }`;
                  const content = (
                    <>
                      <span>{category.name}</span>
                      <CountBadge
                        count={count}
                        active={active}
                        onDark={active}
                      />
                    </>
                  );

                  if (isFilter) {
                    return (
                      <button
                        key={category.slug}
                        type="button"
                        ref={active ? activeMobileRef : undefined}
                        onClick={() => handleCategorySelect(category.slug)}
                        aria-pressed={active}
                        className={className}
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={category.slug}
                      ref={active ? activeMobileRef : undefined}
                      to={`/products/${category.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        {activeCategory && activeProducts.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#E2E5E8] bg-white shadow-[0_14px_34px_-30px_rgba(10,24,38,0.4)]">
            <button
              type="button"
              onClick={() => setMobileListOpen((current) => !current)}
              aria-expanded={mobileListOpen}
              aria-controls="mobile-category-products"
              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4ED] text-[#C7460D]">
                  <PackageIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#5B6B7C]">
                    Products in
                  </span>
                  <span className="block truncate text-[12px] font-semibold text-[#2D3239]">
                    {activeCategory.name}
                  </span>
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2">
                <CountBadge count={activeProducts.length} active />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F5] text-[#C7460D]">
                  <ChevronDownIcon
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      mobileListOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </span>
            </button>

            {mobileListOpen ? (
              <ul
                id="mobile-category-products"
                className="max-h-48 space-y-0.5 overflow-y-auto border-t border-[#E7E9EB] p-2"
              >
                {activeProducts.map((product) => {
                  const productActive =
                    Boolean(activeProductSlug) &&
                    (product.slug === activeProductSlug ||
                      product.id === activeProductSlug);

                  return (
                    <li key={product.id || product.slug}>
                      <button
                        type="button"
                        onClick={() =>
                          handleProductSelect(activeCategory.slug, product)
                        }
                        aria-current={productActive ? "page" : undefined}
                        className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors duration-200 ${
                          productActive
                            ? "bg-[#FFF4ED] font-semibold text-[#C7460D]"
                            : "text-[#5B6B7C] hover:bg-[#F6F7F8] hover:text-[#C7460D]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                            productActive
                              ? "bg-[#C7460D]"
                              : "bg-[#C7460D]/45 group-hover:bg-[#C7460D]"
                          }`}
                        />
                        <span className="truncate">{product.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700"
          >
            <span>{error}</span>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="font-semibold underline underline-offset-2"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Desktop sidebar: white accordion card */}
      <div className="hidden overflow-hidden rounded-none border border-[#E2E5E8] bg-white shadow-[0_18px_42px_-32px_rgba(10,24,38,0.42)] md:block">
        <div className="relative overflow-hidden bg-[#0A1826] px-3.5 py-3.5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#C7460D]/25 blur-2xl" />
          <div className="relative flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-[#FB923C]">
              <PackageIcon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold uppercase tracking-[0.12em] text-white">
                Product Range
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[11px] font-medium text-white/65">
                {allCount} Items
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="All categories" className="p-2">
          {loading && orderedCategories.length === 0 ? (
            <div className="space-y-1">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`animate-pulse rounded-lg bg-[#F3F4F5] ${
                    productDetailStyle ? "h-12" : "h-9"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {isFilter && showAll ? (
                <button
                  type="button"
                  onClick={() => handleCategorySelect("")}
                  aria-pressed={allActive}
                  className={`group relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg py-2.5 pl-3.5 pr-2 text-left text-[14px] font-semibold uppercase tracking-[0.04em] transition-colors duration-200 ${
                    productDetailStyle ? "min-h-14 py-4 text-[15px]" : ""
                  } ${
                    allActive
                      ? "bg-[#FFF4ED] text-[#C7460D]"
                      : "text-[#2D3239] hover:bg-[#F6F7F8] hover:text-[#C7460D]"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-colors ${
                      allActive
                        ? "bg-[#C7460D]"
                        : "bg-transparent group-hover:bg-[#C7460D]/35"
                    }`}
                  />
                  <span className="min-w-0 truncate">{allLabel}</span>
                  <CountBadge count={allCount} active={allActive} />
                </button>
              ) : null}

              {orderedCategories.map((category) => {
                const active = category.slug === activeSlug;
                const count = counts?.[category.slug] ?? 0;
                const items = productsByCategory?.[category.slug] || [];
                const canExpand =
                  Boolean(productsByCategory) && items.length > 0;
                const isOpen = canExpand && openSlug === category.slug;
                const rowClassName = `group relative flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden py-2.5 pl-3.5 pr-2 text-left leading-5 tracking-[0.01em] transition-colors duration-200 ${
                  productDetailStyle
                    ? "min-h-14 py-4 text-[15px]"
                    : "text-[14px]"
                } ${
                  active
                    ? "font-semibold text-[#C7460D]"
                    : "text-[#3F4750] group-hover:text-[#C7460D]"
                }`;
                const content = (
                  <>
                    <span
                      className={`pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-colors ${
                        active
                          ? "bg-[#C7460D]"
                          : "bg-transparent group-hover:bg-[#C7460D]/35"
                      }`}
                    />
                    <span className="min-w-0 truncate">{category.name}</span>
                    <CountBadge count={count} active={active} />
                  </>
                );

                return (
                  <div key={category.slug} className="relative">
                    <div
                      className={`group flex items-stretch overflow-hidden rounded-lg transition-colors duration-200 ${
                        active ? "bg-[#FFF4ED]" : "hover:bg-[#F6F7F8]"
                      }`}
                    >
                      {isFilter ? (
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(category.slug)}
                          aria-pressed={active}
                          title={category.name}
                          className={rowClassName}
                        >
                          {content}
                        </button>
                      ) : (
                        <Link
                          to={`/products/${category.slug}`}
                          aria-current={active ? "page" : undefined}
                          title={category.name}
                          className={rowClassName}
                        >
                          {content}
                        </Link>
                      )}

                      {canExpand ? (
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.slug)}
                          aria-expanded={isOpen}
                          aria-controls={`category-products-${category.slug}`}
                          aria-label={`${
                            isOpen ? "Collapse" : "Expand"
                          } ${category.name} products`}
                          className={`flex shrink-0 items-center justify-center transition-colors duration-200 ${
                            productDetailStyle ? "w-11" : "w-8"
                          } ${
                            isOpen
                              ? "text-[#C7460D]"
                              : "text-[#7A8694] hover:text-[#C7460D]"
                          }`}
                        >
                          <ChevronDownIcon
                            className={`transition-transform duration-200 ${
                              productDetailStyle ? "h-5 w-5" : "h-3.5 w-3.5"
                            } ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      ) : null}
                    </div>

                    {isOpen ? (
                      <ul
                        id={`category-products-${category.slug}`}
                        className="ml-3.5 mt-1 space-y-0.5 border-l border-[#E7E9EB] pl-2.5"
                      >
                        {items.map((product) => {
                          const productActive =
                            Boolean(activeProductSlug) &&
                            (product.slug === activeProductSlug ||
                              product.id === activeProductSlug);

                          return (
                            <li key={product.id || product.slug}>
                              <button
                                type="button"
                                onClick={() =>
                                  handleProductSelect(category.slug, product)
                                }
                                aria-current={
                                  productActive ? "page" : undefined
                                }
                                title={product.name}
                                className={`group/product flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] leading-5 transition-colors duration-200 ${
                                  productActive
                                    ? "bg-[#FFF4ED] font-semibold text-[#C7460D]"
                                    : "text-[#5B6B7C] hover:bg-[#F6F7F8] hover:text-[#C7460D]"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                                    productActive
                                      ? "bg-[#C7460D]"
                                      : "bg-[#C7460D]/45 group-hover/product:bg-[#C7460D]"
                                  }`}
                                />
                                <span className="truncate">
                                  {product.name}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && orderedCategories.length === 0 && !error ? (
            <p className="rounded-lg bg-[#F6F7F8] px-3.5 py-5 text-xs leading-5 text-[#5B6B7C]">
              No categories are available yet.
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-xs leading-5 text-rose-700"
            >
              <p>{error}</p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-1 font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
