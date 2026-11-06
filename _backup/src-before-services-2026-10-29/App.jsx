import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import FeaturedProducts from "./components/FeaturedProducts.jsx";
import Reviews from "./components/Reviews.jsx";
import ContactSection from "./components/ContactSection.jsx";

function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[660px] items-center overflow-hidden bg-ink lg:min-h-[780px]"
    >
      <img
        src="/boiler-hero.jpg"
        alt=""
        aria-hidden="true"
        className="hero-image absolute inset-0 -z-20 h-full w-full object-cover"
      />

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(7,17,28,0.96) 0%, rgba(7,17,28,0.87) 34%, rgba(7,17,28,0.47) 68%, rgba(7,17,28,0.22) 100%)",
        }}
      />

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,17,28,0.62) 0%, rgba(7,17,28,0.08) 32%, rgba(7,17,28,0.18) 64%, rgba(7,17,28,0.88) 100%)",
        }}
      />

      <div className="hero-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute -left-40 top-1/3 -z-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-24 md:pt-28 lg:pb-32 lg:pt-32">
        <div className="max-w-4xl text-white">
          <p className="hero-rise hero-rise-1 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-bright">
            <span className="h-px w-9 bg-brand-bright" />
            Industrial Boiler Solutions
          </p>

          <h1 className="hero-rise hero-rise-2 mt-6 font-display text-[3.4rem] font-semibold uppercase leading-[0.92] tracking-[0.01em] sm:text-7xl lg:text-[5.6rem]">
            Reliable Products for
            <span className="block text-brand-bright">
              Industrial Boiler Needs
            </span>
          </h1>

          <p className="hero-rise hero-rise-3 mt-6 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
            Explore boiler mountings, grate components, industrial valves and
            refractory products for your industrial requirements.
          </p>

          <div className="hero-rise hero-rise-4 mt-9 flex flex-wrap items-center gap-4">
            <a href="#featured" className="btn-primary">
              Explore Products <span aria-hidden="true">→</span>
            </a>
            <a href="#about" className="btn-outline-light">
              Discover Our Company
            </a>
          </div>

          <div className="hero-rise hero-rise-5 mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            <span>Est. 2023</span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-bright sm:block" />
            <span>Ahilyanagar, Maharashtra</span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-bright sm:block" />
            <span>GST Verified</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-6 hidden items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/50 lg:flex">
        <span>Scroll</span>
        <span className="h-12 w-px bg-gradient-to-b from-brand-bright to-transparent" />
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <Hero />
        <FeaturedProducts />
        <Reviews />
        <ContactSection />
      </main>

      <SiteFooter />
    </div>
  );
}
