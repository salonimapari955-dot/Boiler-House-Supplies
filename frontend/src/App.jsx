import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "./components/SiteHeader.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import ServicesSection from "./components/ServicesSection.jsx";
import FeaturedProducts from "./components/FeaturedProducts.jsx";
import PrideNumbers from "./components/PrideNumbers.jsx";
import Reviews from "./components/Reviews.jsx";

function Hero() {
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    const stage = hero?.closest(".home-hero-stage");
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (!hero || !content || !stage || motionPreference.matches)
      return undefined;

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const stickyTop = Number.parseFloat(
        window.getComputedStyle(hero.parentElement).top,
      );
      const stickyStart = stageTop - (Number.isFinite(stickyTop) ? stickyTop : 0);
      const scrollRange = Math.max(1, stage.offsetHeight - hero.offsetHeight);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - stickyStart) / scrollRange),
      );

      hero.style.setProperty(
        "--hero-background-offset",
        `${(progress * -64).toFixed(2)}px`,
      );
      content.style.setProperty(
        "--hero-content-offset",
        `${(progress * -240).toFixed(2)}px`,
      );
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative isolate flex min-h-[540px] items-center overflow-hidden bg-ink lg:min-h-[640px]"
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

      <div
        ref={contentRef}
        className="hero-parallax-content mx-auto w-full max-w-7xl px-5 pb-16 pt-16 md:pt-20 lg:pb-24 lg:pt-24"
      >
        <div className="max-w-4xl text-white">
          <p className="hero-rise hero-rise-1 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.26em] text-brand-bright">
            <span className="h-px w-9 bg-brand-bright" />
            Industrial Boiler Solutions
          </p>

          <h1 className="hero-rise hero-rise-2 mt-5 font-display text-[3.4rem] font-semibold uppercase leading-[0.92] tracking-[0.01em] sm:text-7xl lg:text-[5.6rem]">
            Reliable Products for
            <span className="block text-brand-bright">
              Industrial Boiler Needs
            </span>
          </h1>

          <p className="hero-rise hero-rise-3 mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
            Explore boiler mountings, grate components, industrial valves and
            refractory products for your industrial requirements.
          </p>

          <div className="hero-rise hero-rise-4 mt-8 flex flex-wrap items-center gap-4">
            <a href="#featured" className="btn-primary">
              Explore Products <span aria-hidden="true">→</span>
            </a>
            <Link to="/about/company-brief" className="btn-outline-light">
              Discover Our Company
            </Link>
          </div>

          <div className="hero-rise hero-rise-5 mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            <span>Est. 2023</span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-bright sm:block" />
            <span>Ahilyanagar, Maharashtra</span>
            <span className="hidden h-1 w-1 rounded-full bg-brand-bright sm:block" />
            <span>GST Verified</span>
          </div>
        </div>
      </div>

    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <div className="home-hero-stage">
          <div className="home-hero-pin">
            <Hero />
          </div>
          <ServicesSection />
        </div>
        <FeaturedProducts />
        <PrideNumbers />
        <Reviews />
      </main>

      <SiteFooter />
    </div>
  );
}
