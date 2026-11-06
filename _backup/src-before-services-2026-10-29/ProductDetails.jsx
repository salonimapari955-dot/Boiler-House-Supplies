import { Link, useParams } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import Reveal from "./components/Reveal.jsx";
import { useProducts } from "./hooks/useProducts.js";
import { formatPrice, makeSlug } from "./lib/productCatalog.js";
import {
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
  PackageIcon,
} from "./components/Icons.jsx";

function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-[4/3] animate-pulse bg-paper-deep" />
        <div>
          <div className="h-3 w-32 animate-pulse bg-paper-deep" />
          <div className="mt-6 h-12 w-4/5 animate-pulse bg-paper-deep" />
          <div className="mt-5 h-3 w-full animate-pulse bg-paper-deep" />
          <div className="mt-2 h-3 w-3/4 animate-pulse bg-paper-deep" />
          <div className="mt-8 h-40 w-full animate-pulse bg-paper-deep" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { products, loading, error, warning, reload } = useProducts();
  const loadFailed = Boolean(error || (warning && products.length === 0));

  const product = products.find(
    (item) => item.slug === slug || makeSlug(item.name) === slug,
  );

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <div className="border-b border-line bg-paper-deep">
          <div className="mx-auto max-w-7xl px-5 py-4">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-steel"
            >
              <Link to="/" className="transition-colors hover:text-brand">
                Home
              </Link>
              <span className="text-line">/</span>
              <Link
                to="/products"
                className="transition-colors hover:text-brand"
              >
                Products
              </Link>
              {product && (
                <>
                  <span className="text-line">/</span>
                  <span className="max-w-[220px] truncate text-ink">
                    {product.name}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>

        {loading && <ProductLoading />}

        {!loading && loadFailed && (
          <section className="mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
            <span className="mx-auto flex h-16 w-16 items-center justify-center border border-line bg-white text-brand">
              <PackageIcon className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold uppercase tracking-[0.03em] text-ink">
              Catalogue temporarily unavailable
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-steel">
              We could not load this product right now. Please try again, or
              contact our team for current specifications and availability.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={reload} className="btn-primary">
                Try Again
              </button>
              <Link to="/#contact" className="btn-dark">
                Contact Us
              </Link>
            </div>
          </section>
        )}

        {!loading && !loadFailed && !product && (
          <section className="mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
            <span className="mx-auto flex h-16 w-16 items-center justify-center border border-line bg-white text-brand">
              <PackageIcon className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold uppercase tracking-[0.03em] text-ink">
              Product not found
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-steel">
              This product may have been moved or removed from the catalogue.
              Browse the full product range or contact our team for help.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/products" className="btn-primary">
                View All Products
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/#contact" className="btn-dark">
                Contact Us
              </Link>
            </div>
          </section>
        )}

        {!loading && !loadFailed && product && (
          <section className="py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-5">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                <Reveal>
                  <div className="relative aspect-[4/3] overflow-hidden border border-line bg-paper-deep">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                        <PackageIcon className="h-12 w-12" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                          Product image
                        </span>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 inline-flex items-center border border-white/20 bg-ink/75 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      Boiler House Supplies
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div>
                    {product.category && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                        {product.category}
                      </p>
                    )}

                    <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] text-ink sm:text-5xl">
                      {product.name}
                    </h1>

                    <p className="mt-5 text-sm leading-8 text-steel sm:text-base">
                      {product.description ||
                        "Contact our team for specifications, availability and pricing."}
                    </p>

                    {formatPrice(product.price) && (
                      <p className="mt-6 border-y border-line py-4 font-display text-2xl font-semibold tracking-wide text-ink">
                        {formatPrice(product.price)}
                      </p>
                    )}

                    <div className="mt-7 flex flex-wrap gap-3">
                      <a
                        href={`mailto:info@boilerhouse.in?subject=${encodeURIComponent(
                          `Enquiry for ${product.name}`,
                        )}`}
                        className="btn-primary"
                      >
                        Enquire Now
                        <MailIcon className="h-4 w-4" />
                      </a>
                      <Link to="/products" className="btn-dark">
                        All Products
                      </Link>
                    </div>

                    {product.items.length > 0 && (
                      <div className="mt-9 border border-line bg-white p-6">
                        <h2 className="font-display text-xl font-semibold uppercase tracking-[0.05em] text-ink">
                          Products in this category
                        </h2>
                        <ul className="mt-4 grid gap-3">
                          {product.items.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-3 text-sm leading-6 text-steel"
                            >
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-brand/10 text-brand">
                                <CheckIcon className="h-3 w-3" />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 border border-line bg-paper-deep p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                        Need a specific specification?
                      </p>
                      <p className="mt-2 text-sm leading-7 text-steel">
                        Share your size, quantity or application and our team
                        will confirm availability and pricing.
                      </p>
                      <Link
                        to="/#contact"
                        className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-ink transition-colors hover:text-brand"
                      >
                        Contact Our Team
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
