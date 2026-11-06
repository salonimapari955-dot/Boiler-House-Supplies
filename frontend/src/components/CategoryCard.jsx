import { Link } from "react-router-dom";
import { ArrowRightIcon, PackageIcon } from "./Icons.jsx";

/**
 * Category tile for the All Categories page. The whole card, including the
 * image and the category name, is a link to the existing category route that
 * lists that category's products.
 */
export default function CategoryCard({ category, count, variant = "default" }) {
  const hasCount = typeof count === "number";
  const isSplit = variant === "split";
  const isCompact = variant === "compact";

  return (
    <article
      className={`category-card group h-full overflow-hidden border border-line bg-white ${isSplit ? "category-card--split" : ""}`}
    >
      <Link
        to={`/products/${category.slug}`}
        className={
          isSplit
            ? "grid h-full grid-cols-1 sm:grid-cols-[minmax(0,1fr)_48%]"
            : "flex h-full flex-col"
        }
        aria-label={`View ${category.name} products`}
      >
        <div
          className={`relative overflow-hidden bg-white ${isSplit ? "order-first h-[210px] sm:order-last sm:h-auto sm:min-h-[320px]" : "border-b border-line"}`}
        >
          <div
            className={`flex h-full items-center justify-center ${isSplit ? "p-3 sm:min-h-[320px] sm:p-3" : `${isCompact ? "aspect-[4/3]" : "aspect-square"} p-4 sm:p-5`}`}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                width="1000"
                height="1000"
                loading="lazy"
                decoding="async"
                className={`category-card-image h-full w-full object-contain ${isSplit ? "scale-100 sm:scale-[1.12]" : ""}`}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                <PackageIcon className="h-12 w-12" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Category image
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`category-card-copy relative flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5 ${isSplit ? "justify-between bg-[#d58d8d] text-white sm:px-6 sm:py-6" : ""}`}
        >
          {isSplit ? (
            <span
              aria-hidden="true"
              className="category-card-blueprint pointer-events-none absolute inset-0"
            />
          ) : null}
          <div className="relative">
          <h3 className={`category-card-title min-h-[3.5rem] font-display text-[1.15rem] font-semibold uppercase leading-[1.08] tracking-[0.03em] ${isSplit ? "text-[#0a1826] sm:text-[1.55rem] lg:text-[1.75rem]" : "text-ink sm:text-[1.3rem] lg:min-h-[3.9rem] lg:text-[1.35rem]"}`}>
            {category.name}
          </h3>
          {isSplit && category.description ? (
            <p className="mt-3 line-clamp-4 text-xs font-medium leading-5 text-white/95 sm:mt-4 sm:text-sm sm:leading-6">
              {category.description}
            </p>
          ) : null}
          </div>

          <div className="relative mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-5">
            <span
              className={`category-card-action inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${isSplit ? "text-white" : "text-brand"}`}
            >
              View products
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>

            {hasCount ? (
              <span className={`whitespace-nowrap px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${isSplit ? "border border-white/40 bg-black/10 text-white" : "border border-line bg-paper text-steel"}`}>
                {count} {count === 1 ? "Item" : "Items"}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
