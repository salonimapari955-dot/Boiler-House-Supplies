import { Link } from "react-router-dom";
import { ArrowRightIcon, PackageIcon } from "./Icons.jsx";

/**
 * Minimal product tile for category listings. The image, name and button all
 * lead to the product's full details page, where images, specifications,
 * pricing, MOQ and the brochure PDF are displayed.
 */
export default function ProductCard({ product }) {
  const productPath = `/products/${product.slug}`;

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
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <PackageIcon className="h-10 w-10" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
        <h3 className="font-display text-[1.3rem] font-semibold uppercase leading-[1.15] tracking-[0.04em] text-ink sm:text-[1.45rem]">
          <Link
            to={productPath}
            className="transition-colors duration-200 hover:text-brand group-hover:text-brand"
          >
            {product.name}
          </Link>
        </h3>

        <Link
          to={productPath}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-brand bg-brand px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-brand/90"
        >
          View Product Details
          <ArrowRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden border border-line bg-white">
      <div className="aspect-[4/3] animate-pulse bg-paper-deep" />
      <div className="px-4 py-4 sm:px-5">
        <div className="h-6 w-3/4 animate-pulse bg-paper-deep" />
        <div className="mt-4 h-9 w-full animate-pulse bg-paper-deep" />
      </div>
    </div>
  );
}
