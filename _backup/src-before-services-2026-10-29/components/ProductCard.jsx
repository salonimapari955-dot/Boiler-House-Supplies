import { Link } from "react-router-dom";
import { formatPrice } from "../lib/productCatalog.js";
import { ArrowRightIcon, PackageIcon } from "./Icons.jsx";

export default function ProductCard({ product, index = 0 }) {
  const productPath = `/products/${product.slug}`;
  const price = formatPrice(product.price);
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="product-card group flex h-full flex-col overflow-hidden border border-line bg-white">
      <Link
        to={productPath}
        className="relative block aspect-[4/3] overflow-hidden bg-paper-deep"
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="product-card-image h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
            <PackageIcon className="h-10 w-10" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
              Product image
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent opacity-80" />

        <span className="absolute left-4 top-4 inline-flex h-9 min-w-9 items-center justify-center border border-white/25 bg-ink/70 px-2 font-display text-sm font-semibold tracking-[0.08em] text-white backdrop-blur-sm">
          {number}
        </span>

        {product.category && (
          <span className="absolute bottom-4 left-4 border border-white/20 bg-ink/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-[1.7rem] font-semibold uppercase leading-[1.1] tracking-[0.04em] text-ink">
          {product.name}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-steel">
          {product.description ||
            "Contact our team for specifications, availability and pricing."}
        </p>

        {price && (
          <p className="mt-4 font-display text-xl font-semibold tracking-wide text-ink">
            {price}
          </p>
        )}

        <Link
          to={productPath}
          className="mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition-colors duration-200 hover:text-brand"
        >
          View Product
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden border border-line bg-white">
      <div className="aspect-[4/3] animate-pulse bg-paper-deep" />
      <div className="flex flex-1 flex-col p-6">
        <div className="h-7 w-3/4 animate-pulse bg-paper-deep" />
        <div className="mt-4 h-3 w-full animate-pulse bg-paper-deep" />
        <div className="mt-2 h-3 w-5/6 animate-pulse bg-paper-deep" />
        <div className="mt-8 h-3 w-32 animate-pulse bg-paper-deep" />
      </div>
    </div>
  );
}
