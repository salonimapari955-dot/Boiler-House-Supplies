import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts.js";
import { pickFeaturedProducts } from "../lib/productCatalog.js";
import Reveal from "./Reveal.jsx";
import ProductCard, { ProductCardSkeleton } from "./ProductCard.jsx";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  PackageIcon,
} from "./Icons.jsx";

export default function FeaturedProducts() {
  const { products, loading, error, warning, reload } = useProducts();
  const loadFailed = Boolean(error || (warning && products.length === 0));
  const featuredProducts = pickFeaturedProducts(products, 3);

  return (
    <section id="featured" className="relative scroll-mt-24 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="max-w-2xl">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
              <span className="h-px w-8 bg-brand" />
              Featured Products
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] text-ink sm:text-5xl">
              Selected from our
              <span className="text-brand"> product range</span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-steel sm:text-base">
              A focused look at three products from our range. Browse the full
              catalogue for specifications and availability.
            </p>
          </div>
        </Reveal>

        <div className="mt-12">
          {loading && (
            <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <ProductCardSkeleton key={item} />
              ))}
            </div>
          )}

          {!loading && loadFailed && (
            <Reveal>
              <div className="border border-line bg-white px-6 py-14 text-center">
                <PackageIcon className="mx-auto h-10 w-10 text-brand" />
                <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  Products are temporarily unavailable
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                  We could not load the product catalogue right now. Please
                  try again, or contact our team for current availability.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={reload} className="btn-primary">
                    Try Again
                  </button>
                  <Link to="/#contact" className="btn-dark">
                    Contact Us
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {!loading && !loadFailed && featuredProducts.length === 0 && (
            <Reveal>
              <div className="border border-dashed border-line bg-white px-6 py-16 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center border border-line bg-paper text-brand">
                  <PackageIcon className="h-8 w-8" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                  Product catalogue is being updated
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                  Our team is preparing the latest product listings. Contact us
                  with your requirement and we will share current specifications
                  and availability.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/#contact" className="btn-primary">
                    Request a Product
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link to="/products" className="btn-dark">
                    View Product Range
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          {!loading && !loadFailed && featuredProducts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredProducts.map((product, index) => (
                <Reveal key={product.id} delay={index * 90} className="h-full">
                  <ProductCard product={product} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={120}>
          <div className="mt-14 flex flex-col items-center gap-4 border-t border-line pt-10 text-center">
            <Link to="/products" className="btn-dark group">
              Explore All Products
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
