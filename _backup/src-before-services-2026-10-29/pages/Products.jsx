import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import ProductCard, {
  ProductCardSkeleton,
} from "../components/ProductCard.jsx";
import Reveal from "../components/Reveal.jsx";
import { useProducts } from "../hooks/useProducts.js";
import {
  ArrowRightIcon,
  PackageIcon,
  ShieldCheckIcon,
} from "../components/Icons.jsx";

export default function Products() {
  const { products, loading, error, warning, reload } = useProducts();
  const loadFailed = Boolean(error || (warning && products.length === 0));

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-ink py-16 text-white md:py-20">
          <div className="industrial-grid absolute inset-0 opacity-70" />
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
            >
              <Link
                to="/"
                className="transition-colors duration-200 hover:text-brand-bright"
              >
                Home
              </Link>
              <span className="text-white/25">/</span>
              <span className="text-slate-200">Products</span>
            </nav>

            <p className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-bright">
              <span className="h-px w-8 bg-brand-bright" />
              Product Range
            </p>

            <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold uppercase leading-[0.96] tracking-[0.02em] sm:text-5xl lg:text-6xl">
              Industrial boiler
              <span className="block text-brand-bright">
                components &amp; supplies
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Browse the complete catalogue of boiler castings, mountings,
              grate components, valves and refractory products. Contact our
              team for specifications, availability and pricing.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-brand-bright" />
              GST 27ABBFB3295L1Z6
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                  Catalogue
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-4xl">
                  All Products
                </h2>
              </div>

              {!loading && !loadFailed && (
                <p className="text-xs font-medium tracking-wide text-steel">
                  {products.length} product{products.length === 1 ? "" : "s"}{" "}
                  available
                </p>
              )}
            </div>

            <div className="mt-10">
              {loading && (
                <div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  aria-hidden="true"
                >
                  {[0, 1, 2, 3, 4, 5].map((item) => (
                    <ProductCardSkeleton key={item} />
                  ))}
                </div>
              )}

              {!loading && loadFailed && (
                <div className="border border-line bg-white px-6 py-16 text-center">
                  <PackageIcon className="mx-auto h-10 w-10 text-brand" />
                  <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                    Product catalogue unavailable
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                    We could not load the product catalogue right now. Please
                    try again, or contact our team for current availability.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={reload}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                    <Link to="/#contact" className="btn-dark">
                      Contact Us
                    </Link>
                  </div>
                </div>
              )}

              {!loading && !loadFailed && products.length === 0 && (
                <div className="border border-dashed border-line bg-white px-6 py-16 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center border border-line bg-paper text-brand">
                    <PackageIcon className="h-8 w-8" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink">
                    Products are being updated
                  </h3>
                  <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-steel">
                    Our team is preparing the latest catalogue. Contact us with
                    your requirement and we will share current specifications
                    and availability.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/#contact" className="btn-primary">
                      Request a Product
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <Link to="/" className="btn-dark">
                      Back to Home
                    </Link>
                  </div>
                </div>
              )}

              {!loading && !loadFailed && products.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <Reveal
                      key={product.id}
                      delay={(index % 3) * 80}
                      className="h-full"
                    >
                      <ProductCard product={product} index={index} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            <Reveal>
              <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-line bg-white p-6 sm:flex-row sm:items-center sm:p-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    Need something specific?
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-3xl">
                    Send us your requirement
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-steel">
                    Share the product, size or application and our team will
                    help with availability and pricing.
                  </p>
                </div>
                <Link to="/#contact" className="btn-primary shrink-0">
                  Contact Our Team
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
