import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import Reveal from "../components/Reveal.jsx";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BankIcon,
  BricksIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  GaugeIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  QuoteIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
} from "../components/Icons.jsx";

const heroFacts = [
  { label: "Established", value: "2023" },
  { label: "Company CEO", value: "Shubham Mundada" },
  { label: "Legal Status", value: "Partnership" },
];

const highlights = [
  {
    label: "Established",
    value: "2023",
    icon: CalendarIcon,
  },
  {
    label: "Nature of Business",
    value: "Trader – Retailer",
    note: "Import, export & services",
    icon: BuildingIcon,
  },
  {
    label: "Total Employees",
    value: "Upto 10 People",
    icon: UsersIcon,
  },
  {
    label: "Export Markets",
    value: "5 Countries",
    note: "Kenya · Rwanda · Colombia · Nigeria · Nepal",
    icon: GlobeIcon,
  },
];

const productRange = [
  {
    title: "Boiler Castings",
    icon: PackageIcon,
  },
  {
    title: "Boiler Mountings",
    icon: GaugeIcon,
  },
  {
    title: "Large Boiler Castings",
    icon: BricksIcon,
  },
  {
    title: "Retail, Trade & Import",
    detail: "Retailer, trader & importer",
    icon: GlobeIcon,
  },
];

const commitments = [
  {
    title: "Customer expectations",
    body: "We direct all our activities to cater the expectations of customers by providing them excellent quality products as per their gratification.",
    icon: CheckIcon,
  },
  {
    title: "Transparent transactions",
    body: "We follow moral business policies and crystal pure transparency in all our transactions to keep healthy relations with the customers.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Guided by leadership",
    body: "For our accomplishment story, we are grateful to our Mr. Shubham Mundada, whose continual backing and direction have been useful to us for attaining exponential development in the current market.",
    icon: BriefcaseIcon,
  },
];

const factsheet = [
  { label: "Nature of Business", value: "Trader – Retailer" },
  {
    label: "Additional Business",
    value: "Retail Business, Import, Export, Supplier of Services",
  },
  { label: "Company CEO", value: "Shubham Mundada" },
  {
    label: "Registered Address",
    value:
      "S No 91 A B C D, Plot No 72-73/8, Wadgaon Gupta Road, Samrat Nagar, Ahmednagar 414111, Maharashtra, India",
  },
  { label: "Total Number of Employees", value: "Upto 10 People" },
  { label: "GST Registration Date", value: "18-08-2023" },
  { label: "Legal Status of Firm", value: "Partnership" },
  { label: "Annual Turnover", value: "40 L – 1.5 Cr" },
  {
    label: "GST Partner Name",
    value: "Varsha Sachin Walke, Shubham Shriram Mundada",
  },
  {
    label: "Top Export Countries",
    value: "Kenya, Rwanda, Colombia, Nigeria, Nepal",
  },
];

const tradeProfile = [
  {
    label: "Export Percentage",
    value: "upto 20%",
    icon: GlobeIcon,
  },
  {
    label: "Import Export Code (IEC)",
    value: "ABBFB3295L",
    icon: ShieldCheckIcon,
  },
  {
    label: "Banker",
    value: "IDBI Bank Ltd",
    icon: BankIcon,
  },
  {
    label: "GST No.",
    value: "27ABBFB3295L1Z6",
    icon: ShieldCheckIcon,
  },
  {
    label: "Payment Mode",
    value: "Cash, Cheque",
    icon: BriefcaseIcon,
  },
  {
    label: "Shipment Mode",
    value: "By Air, By Road, By Cargo, By Sea",
    icon: TruckIcon,
  },
  {
    label: "Major Market",
    value: "World Wide",
    icon: GlobeIcon,
  },
];

const gallery = [
  {
    src: "/company/boiler-house-signboard.jpeg",
    alt: "Boiler House Supplies company signboard",
    width: 1000,
    height: 563,
    caption: "Our Signboard",
    location: "Ahilyanagar",
  },
  {
    src: "/company/boiler-house-office.png",
    alt: "Boiler House Supplies office",
    width: 1000,
    height: 449,
    caption: "Our Office",
    location: "Ahilyanagar",
  },
  {
    src: "/company/boiler-house-vendor-base.png",
    alt: "Boiler House Supplies vendor base",
    width: 1000,
    height: 432,
    caption: "Our Vendor Base",
    location: "World Wide",
  },
];

const exportCountries = ["Kenya", "Rwanda", "Colombia", "Nigeria", "Nepal"];

function SectionLabel({ children, tone = "clay" }) {
  const tones = {
    clay: "text-[#a84b32]",
    sage: "text-[#4c6047]",
    cream: "text-[#f9e7dd]",
  };

  return (
    <p
      className={`inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] ${tones[tone]}`}
    >
      <span className="h-px w-8 bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

function HeadingUnderline({ tone = "clay" }) {
  const tones = {
    clay: "",
    light: "cb-underline--light",
  };

  return (
    <span aria-hidden="true" className={`cb-underline ${tones[tone]}`.trim()} />
  );
}

function SectionRule({ tone = "clay" }) {
  const tones = {
    clay: "bg-[#a84b32]",
    sage: "bg-[#35452f]",
    cream: "bg-[#f9e7dd]",
  };

  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <span className={`h-1.5 w-1.5 rotate-45 ${tones[tone]}`} />
      <span className="h-px flex-1 bg-current opacity-15" />
    </div>
  );
}

export default function CompanyBrief() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartRef = useRef(null);
  const swipeTimeRef = useRef(null);
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const activeImage = gallery[activeIndex];

  // Lift the Introduction "sheet" over the bottom edge of the hero as the
  // visitor starts scrolling. Only a transform is animated, so layout, focus
  // and click targets stay put; reduced-motion users get a flush, static sheet.
  useEffect(() => {
    const hero = heroRef.current;
    const intro = introRef.current;
    if (!hero || !intro) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let overlap = 0;
    let frame = 0;

    const measure = () => {
      const marginTop = parseFloat(window.getComputedStyle(intro).marginTop);
      overlap = Number.isFinite(marginTop) ? Math.max(0, -marginTop) : 0;
    };

    const update = () => {
      frame = 0;

      if (reduceMotion.matches) {
        intro.style.setProperty("--cb-intro-lift", "0px");
        return;
      }

      const viewport = window.innerHeight || 0;
      const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      const travel = Math.max(160, Math.min(320, viewport * 0.26));
      const scrollStart = heroBottom - viewport;
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - scrollStart) / travel),
      );
      const eased = 1 - (1 - progress) ** 3;

      intro.style.setProperty(
        "--cb-intro-lift",
        `${((1 - eased) * overlap).toFixed(2)}px`,
      );
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      measure();
      requestUpdate();
    };

    measure();
    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    reduceMotion.addEventListener?.("change", handleResize);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      reduceMotion.removeEventListener?.("change", handleResize);
    };
  }, []);

  const showSlide = (offset) => {
    setActiveIndex(
      (current) => (current + offset + gallery.length) % gallery.length,
    );
  };

  const handleImageClick = () => {
    // A swipe also emits a click; ignore that click once.
    if (
      swipeTimeRef.current !== null &&
      Date.now() - swipeTimeRef.current < 350
    ) {
      swipeTimeRef.current = null;
      return;
    }
    swipeTimeRef.current = null;
    showSlide(1);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(-1);
    }
  };

  const handleTouchStart = (event) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    swipeTimeRef.current = null;
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;

    if (!start) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    swipeTimeRef.current = Date.now();
    showSlide(deltaX < 0 ? 1 : -1);
  };

  return (
    <div className="company-brief min-h-screen bg-[#faf6ee] font-sans text-[#1e2a23]">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section
          ref={heroRef}
          className="company-brief-hero relative isolate flex flex-col overflow-hidden bg-[#f4ecdf]"
        >
          <img
            src="/company/boiler-house-signboard.jpeg"
            alt=""
            aria-hidden="true"
            width="1000"
            height="563"
            fetchPriority="high"
            className="company-hero-media hero-image absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="company-hero-scrim absolute inset-0 -z-10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#f4ecdf] to-transparent md:h-40"
          />

          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 z-10 h-1 bg-[#a84b32]"
          />

          <div className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col px-5 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="hero-rise flex flex-wrap items-center gap-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5f6b5f]"
            >
              <Link
                to="/"
                className="transition-colors duration-200 hover:text-[#a84b32]"
              >
                Home
              </Link>
              <span className="text-[#a99a86]">/</span>
              <Link
                to="/#about"
                className="transition-colors duration-200 hover:text-[#a84b32]"
              >
                About Us
              </Link>
              <span className="text-[#a99a86]">/</span>
              <span className="text-[#1e2a23]">Company Brief</span>
            </nav>

            <div className="grid flex-1 content-center gap-7 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:py-10">
              <div className="relative z-10 flex flex-col justify-center lg:pr-6">
                <span
                  aria-hidden="true"
                  className="hero-rise hero-rise-1 flex items-center gap-3"
                >
                  <span className="h-px w-12 bg-[#a84b32]" />
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#a84b32]" />
                </span>

                <h1
                  aria-label="Company Brief"
                  className="company-brief-title mt-4 font-display text-[clamp(3.4rem,7vw,6rem)] font-semibold uppercase leading-[0.84] tracking-[-0.015em] text-[#1e2a23]"
                >
                  Company
                  <span className="block text-[#a84b32]">Brief</span>
                </h1>

                <div className="hero-rise hero-rise-4 mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="#company-profile"
                    className="group inline-flex items-center justify-center gap-2 bg-[#a84b32] px-7 py-4 text-sm font-bold text-[#fbf7ee] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8b3b26] hover:shadow-[0_18px_35px_-20px_rgba(168,75,50,0.9)]"
                  >
                    Explore Company Brief
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                  <Link
                    to="/about/testimonials"
                    className="inline-flex items-center justify-center gap-2 border-2 border-[#1e2a23] bg-[#fbf7ee]/90 px-7 py-4 text-sm font-bold text-[#1e2a23] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1e2a23] hover:text-[#fbf7ee]"
                  >
                    Customer Testimonials
                    <QuoteIcon className="h-4 w-4" />
                  </Link>
                </div>

                <div className="hero-rise hero-rise-5 mt-5 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-2 border border-[#c8b7a0] bg-[#fbf7ee] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3d4a3f]">
                    <ShieldCheckIcon className="h-4 w-4 text-[#a84b32]" />
                    GST 27ABBFB3295L1Z6
                  </span>
                  <span className="inline-flex items-center gap-2 border border-[#c8b7a0] bg-[#fbf7ee] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3d4a3f]">
                    <MapPinIcon className="h-4 w-4 text-[#a84b32]" />
                    Ahilyanagar, Maharashtra
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-center">
                <aside className="hero-rise hero-rise-4 w-full max-w-md border border-[#d9cdbb] bg-[#fbf7ee]/95 shadow-[0_35px_75px_-45px_rgba(30,42,35,0.6)] backdrop-blur-sm lg:ml-auto">
                  <div
                    className="h-1.5 w-full bg-[#a84b32]"
                    aria-hidden="true"
                  />

                  <div className="p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a84b32]">
                      <span
                        className="h-px w-5 bg-[#a84b32]"
                        aria-hidden="true"
                      />
                      At a Glance
                    </p>

                    <dl className="mt-4 grid gap-2.5">
                      {heroFacts.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start justify-between gap-4 border-b border-[#e2d5c2] pb-2.5 transition-colors duration-300 hover:border-[#a84b32]/60 last:border-0 last:pb-0"
                        >
                          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5f6b5f]">
                            {item.label}
                          </dt>
                          <dd className="max-w-[58%] text-right text-[15px] font-bold text-[#1e2a23]">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-3.5 border-t border-[#e2d5c2] pt-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5f6b5f]">
                        Core business
                      </p>
                      <p className="mt-1.5 font-display text-xl font-semibold uppercase tracking-[0.03em] text-[#1e2a23]">
                        Retailer · Trader · Importer
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section
          ref={introRef}
          id="company-profile"
          className="company-brief-intro relative scroll-mt-24"
        >
          <div className="company-brief-sheet relative overflow-hidden border-t border-[#d9cdbb] bg-[#faf6ee] py-12 md:py-16">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 top-10 font-display text-[11rem] font-semibold leading-none text-[#a84b32]/[0.045] sm:text-[16rem]"
            >
              01
            </span>

            <div className="relative mx-auto max-w-7xl px-5">
              <Reveal>
                <SectionRule />
              </Reveal>

              <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-10">
                <Reveal variant="image" className="lg:col-span-6">
                  <figure className="group relative">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-4 -top-4 h-24 w-24 border-l-2 border-t-2 border-[#a84b32]/45"
                    />
                    <div className="relative overflow-hidden bg-[#e6dbc9]">
                      <img
                        src="/company/boiler-house-industrial-boiler.jpg"
                        alt="Boiler House Supplies pulsating grate bar"
                        width="1000"
                        height="562"
                        loading="lazy"
                        decoding="async"
                        className="cb-zoom aspect-[16/9] w-full object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2b2118]/45 via-transparent to-transparent"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fbf7ee]">
                        <span>Boiler Castings</span>
                      </figcaption>
                    </div>
                  </figure>
                </Reveal>

                <div className="lg:col-span-6 lg:col-start-7">
                  <Reveal delay={80}>
                    <h2 className="mt-4 font-display text-[clamp(2.4rem,4.2vw,4rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]">
                      Introduction
                    </h2>
                    <HeadingUnderline />
                  </Reveal>

                  <Reveal delay={150}>
                    <div className="mt-5">
                      <p className="text-[16px] leading-7 text-[#3d4a3f]">
                        Boiler House Supplies is a retailer, trader and importer
                        of boiler castings, boiler mountings, large boiler
                        castings and many more. The company operates from
                        Ahilyanagar, Maharashtra, and follows moral business
                        policies and crystal pure transparency in all
                        transactions.
                      </p>
                      <p className="mt-4 text-[16px] leading-7 text-[#3d4a3f]">
                        Every activity is directed towards catering to customer
                        expectations with excellent quality products while
                        maintaining healthy, long-term customer relationships.
                      </p>

                      <div className="group relative mt-6 overflow-hidden border-l-4 border-[#a84b32] bg-[#dfe7d4] py-5 pl-6 pr-5 transition-colors duration-500 hover:bg-[#d7e1c9] sm:pl-8">
                        <QuoteIcon
                          className="absolute -right-2 -top-2 h-16 w-16 text-[#4c6047]/10 transition-transform duration-500 group-hover:scale-110"
                          aria-hidden="true"
                        />
                        <p className="relative font-serif text-xl italic leading-7 text-[#2f3f34] sm:text-2xl sm:leading-8">
                          “Boiler castings, boiler mountings, large boiler
                          castings &amp; many more.”
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company facts */}
        <section
          className="relative overflow-hidden bg-[#a84b32] py-10 md:py-14"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 0%, rgba(251,247,238,0.14), transparent 42%), radial-gradient(circle at 92% 100%, rgba(30,42,35,0.18), transparent 48%)",
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-12 font-display text-[14rem] font-semibold leading-none text-[#fbf7ee]/[0.07] sm:text-[22rem]"
          >
            2023
          </span>

          <div className="relative mx-auto max-w-7xl px-5">
            <div className="grid gap-5 border-b border-[#fbf7ee]/30 pb-6 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-7">
                <h2 className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#fbf7ee]">
                  The essentials
                </h2>
                <HeadingUnderline tone="light" />
              </Reveal>
            </div>

            <div className="mt-7 grid gap-y-7 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal
                    key={item.label}
                    delay={index * 80}
                    className="h-full"
                  >
                    <div className="group relative h-full border-l border-[#fbf7ee]/25 pl-6 pr-4 transition-colors duration-500 hover:border-[#fbf7ee]/70">
                      <div className="flex items-center gap-2 text-[#f9e7dd]">
                        <Icon className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em]">
                          {item.label}
                        </p>
                      </div>
                      <p className="mt-3 break-words font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[0.86] tracking-[0.005em] text-[#fbf7ee]">
                        {item.value}
                      </p>
                      {item.note ? (
                        <p className="mt-3 max-w-[15rem] text-xs leading-5 text-[#f9e7dd]">
                          {item.note}
                        </p>
                      ) : null}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-1 top-0 font-display text-4xl font-semibold text-[#fbf7ee]/10 transition-colors duration-500 group-hover:text-[#fbf7ee]/20"
                      >
                        0{index + 1}
                      </span>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={140}>
              <div className="mt-8 flex flex-col gap-4 border-t border-[#fbf7ee]/30 pt-6 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#f9e7dd]">
                  Export markets
                </p>
                <div className="flex flex-wrap items-center gap-x-7 gap-y-2 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-[#fbf7ee] sm:text-3xl">
                  {exportCountries.map((country, index) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-5"
                    >
                      <span className="transition-colors duration-300 hover:text-[#f9e7dd]">
                        {country}
                      </span>
                      {index < exportCountries.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="hidden h-1.5 w-1.5 rotate-45 bg-[#fbf7ee]/40 sm:inline-block"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Product range */}
        <section className="relative overflow-hidden bg-[#f2e8da] py-12 md:py-16">
          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule />
            </Reveal>

            <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <Reveal delay={70}>
                    <h2
                      aria-label="What we supply"
                      className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                    >
                      What we
                      <span className="block text-[#a84b32]">supply</span>
                    </h2>
                    <HeadingUnderline />
                  </Reveal>

                  <Reveal delay={130}>
                    <a
                      href="#factsheet"
                      className="group mt-6 inline-flex items-center gap-2 border-b-2 border-[#a84b32] pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a84b32] transition-colors duration-300 hover:text-[#6f2f1f]"
                    >
                      View company factsheet
                      <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </Reveal>
                </div>
              </div>

              <div className="lg:col-span-7 lg:col-start-6">
                <div className="border-b border-[#c9b8a0]">
                  {productRange.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Reveal key={item.title} delay={index * 70}>
                        <article className="group relative flex items-center gap-4 border-t border-[#c9b8a0] py-4 transition-all duration-500 hover:border-[#a84b32] sm:gap-6 sm:py-5">
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-0 bg-[#fbf7ee]/70 transition-all duration-500 group-hover:w-full"
                          />

                          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center border border-[#a84b32]/40 bg-[#faf3e7] text-[#a84b32] transition-colors duration-500 group-hover:bg-[#a84b32] group-hover:text-[#fbf7ee] sm:h-14 sm:w-14">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                          </span>

                          <div className="relative min-w-0 flex-1">
                            <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.7rem)] font-semibold uppercase leading-[0.95] tracking-[0.01em] text-[#1e2a23] transition-transform duration-500 group-hover:translate-x-1">
                              {item.title}
                            </h3>
                            {item.detail ? (
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d6f5e]">
                                {item.detail}
                              </p>
                            ) : null}
                          </div>

                          <span
                            aria-hidden="true"
                            className="relative font-display text-3xl font-semibold leading-none text-[#1e2a23]/15 transition-colors duration-500 group-hover:text-[#a84b32]/30 sm:text-5xl"
                          >
                            0{index + 1}
                          </span>

                          <ArrowUpRightIcon className="relative h-5 w-5 shrink-0 text-[#a84b32] opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:-translate-x-2" />
                        </article>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company story */}
        <section className="relative overflow-hidden bg-[#dfe7d4] py-12 md:py-16">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 bottom-0 font-display text-[13rem] font-semibold leading-none text-[#35452f]/[0.045] sm:text-[19rem]"
          >
            04
          </span>

          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule tone="sage" />
            </Reveal>

            <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
              <div className="lg:col-span-5">
                <Reveal delay={70}>
                  <h2 className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]">
                    Our <span className="text-[#a84b32]">story</span>
                  </h2>
                  <HeadingUnderline />
                </Reveal>

                <div className="mt-6">
                  {commitments.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Reveal key={item.title} delay={index * 70}>
                        <article className="group grid grid-cols-[auto_1fr] gap-4 border-t border-[#35452f]/20 py-4 transition-colors duration-500 hover:border-[#a84b32]/60">
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-[#a84b32]/30 bg-[#fbf7ee]/60 text-[#a84b32] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:bg-[#a84b32] group-hover:text-[#fbf7ee]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <div className="flex items-baseline justify-between gap-3">
                              <h3 className="font-display text-2xl font-semibold uppercase leading-tight tracking-[0.03em] text-[#1e2a23]">
                                {item.title}
                              </h3>
                              <span
                                aria-hidden="true"
                                className="font-display text-lg font-semibold text-[#35452f]/30"
                              >
                                0{index + 1}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#35452f]">
                              {item.body}
                            </p>
                          </div>
                        </article>
                      </Reveal>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-6 lg:col-start-7 lg:mt-10">
                <figure className="group relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-5 -right-5 h-[72%] w-[72%] bg-[#a84b32]"
                  />

                  <Reveal
                    variant="image"
                    className="relative overflow-hidden border-[10px] border-[#fbf7ee] shadow-[0_35px_70px_-50px_rgba(30,42,35,0.6)]"
                  >
                    <img
                      src="/company/boiler-house-steam-plant.jpg"
                      alt="Boiler House Supplies office"
                      width="1000"
                      height="449"
                      loading="lazy"
                      decoding="async"
                      className="cb-zoom aspect-[16/9] w-full object-cover"
                    />
                  </Reveal>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="relative overflow-hidden bg-[#faf6ee] py-12 md:py-16">
          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule />
            </Reveal>

            <div className="mt-7 grid gap-5 md:grid-cols-12 md:items-end">
              <Reveal className="md:col-span-7">
                <h2
                  aria-label="Inside Boiler House Supplies"
                  className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                >
                  Inside Boiler House
                  <span className="block text-[#a84b32]">Supplies</span>
                </h2>
                <HeadingUnderline />
              </Reveal>

              <Reveal
                delay={100}
                className="md:col-span-4 md:col-start-9"
              ></Reveal>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
              <Reveal variant="image" className="lg:col-span-9">
                <div className="group relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-3 border border-[#a84b32]/25"
                  />

                  <div className="relative overflow-hidden bg-[#e6dbc9]">
                    <button
                      type="button"
                      onClick={handleImageClick}
                      onKeyDown={handleKeyDown}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      aria-label="Show the next company photograph"
                      className="relative block aspect-[4/3] w-full cursor-pointer touch-pan-y sm:aspect-[16/9]"
                    >
                      {gallery.map((image, index) => {
                        const isActive = index === activeIndex;

                        return (
                          <span
                            key={image.src}
                            aria-hidden={!isActive}
                            className={`absolute inset-0 block transition-[opacity,transform] duration-700 ease-out ${
                              isActive
                                ? "scale-100 opacity-100"
                                : "scale-[1.04] opacity-0"
                            }`}
                          >
                            <img
                              src={image.src}
                              alt={image.alt}
                              width={image.width}
                              height={image.height}
                              loading={index === 0 ? "eager" : "lazy"}
                              decoding="async"
                              className="cb-zoom h-full w-full object-cover"
                            />
                          </span>
                        );
                      })}

                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1e2a23]/45 to-transparent"
                      />
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120} className="lg:col-span-3">
                <div className="border-t-2 border-[#1e2a23] pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#a84b32]">
                    Photograph {activeIndex + 1} / {gallery.length}
                  </p>

                  <p
                    aria-live="polite"
                    aria-atomic="true"
                    className="mt-2 font-display text-3xl font-semibold uppercase leading-none tracking-[0.02em] text-[#1e2a23]"
                  >
                    {activeImage.caption}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a6a58]">
                    {activeImage.location}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showSlide(-1)}
                      aria-label="Show the previous company photograph"
                      className="inline-flex h-10 w-10 items-center justify-center border border-[#c8b7a0] text-[#1e2a23] transition-colors duration-300 hover:border-[#a84b32] hover:bg-[#a84b32] hover:text-[#fbf7ee]"
                    >
                      <ArrowRightIcon className="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => showSlide(1)}
                      aria-label="Show the next company photograph"
                      className="inline-flex h-10 w-10 items-center justify-center border border-[#c8b7a0] text-[#1e2a23] transition-colors duration-300 hover:border-[#a84b32] hover:bg-[#a84b32] hover:text-[#fbf7ee]"
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div
                    role="group"
                    aria-label="Select a photograph"
                    className="mt-4 flex items-center gap-2"
                  >
                    {gallery.map((image, index) => (
                      <button
                        key={image.src}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Show ${image.caption}`}
                        aria-current={
                          index === activeIndex ? "true" : undefined
                        }
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          index === activeIndex
                            ? "w-9 bg-[#a84b32]"
                            : "w-2.5 bg-[#cdbda8] hover:bg-[#a84b32]/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Factsheet */}
        <section
          id="factsheet"
          className="relative scroll-mt-24 overflow-hidden bg-[#f3e9db] py-12 md:py-16"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 top-12 font-display text-[12rem] font-semibold leading-none text-[#a84b32]/[0.05] sm:text-[18rem]"
          >
            06
          </span>

          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule />
            </Reveal>

            <div className="mt-7 grid gap-6 border-b-2 border-[#1e2a23] pb-6 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-5">
                <h2
                  aria-label="Company factsheet"
                  className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                >
                  Company
                  <span className="block text-[#a84b32]">factsheet</span>
                </h2>
                <HeadingUnderline />
              </Reveal>
            </div>

            <dl className="mt-1 grid lg:grid-cols-2 lg:gap-x-20">
              {factsheet.map((item, index) => (
                <Reveal key={item.label} delay={(index % 4) * 50}>
                  <div className="group grid gap-2 border-b border-[#d3c3ae] py-3.5 transition-colors duration-300 hover:bg-[#fbf7ee] sm:grid-cols-[13rem_1fr] sm:gap-6 sm:px-3">
                    <dt className="flex items-start gap-2 text-[10px] font-bold uppercase leading-5 tracking-[0.16em] text-[#a84b32]">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a84b32] transition-transform duration-300 group-hover:rotate-0"
                      />
                      {item.label}
                    </dt>
                    <dd className="text-[15px] font-semibold leading-7 text-[#1e2a23]">
                      {item.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Trade & market */}
        <section
          id="trade-market"
          className="relative scroll-mt-24 overflow-hidden bg-[#faf6ee] py-12 md:py-16"
        >
          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule />
            </Reveal>

            <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
              <div className="lg:col-span-5">
                <figure className="group relative lg:sticky lg:top-28">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-4 -top-4 h-full w-full border-2 border-[#a84b32]/45"
                  />

                  <Reveal
                    variant="image"
                    className="relative overflow-hidden border-[10px] border-[#faf6ee]"
                  >
                    <img
                      src="/company/boiler-house-trade-export.jpg"
                      alt="Boiler House Supplies vendor base"
                      width="1000"
                      height="432"
                      loading="lazy"
                      decoding="async"
                      className="cb-zoom aspect-[2/1] w-full object-cover"
                    />

                    <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 bg-[#a84b32]/95 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]">
                      <span>Our Vendor Base</span>
                      <span className="text-[#f9e7dd]">
                        Major Market · World Wide
                      </span>
                    </figcaption>
                  </Reveal>
                </figure>
              </div>

              <div className="lg:col-span-6 lg:col-start-7">
                <Reveal>
                  <h2
                    aria-label="Trade and market profile"
                    className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                  >
                    Trade &amp; market
                    <span className="block text-[#a84b32]">profile</span>
                  </h2>
                  <HeadingUnderline />
                </Reveal>

                <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
                  {tradeProfile.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Reveal key={item.label} delay={index * 40}>
                        <div className="group flex items-start gap-4 border-t border-[#d3c3ae] py-3.5 transition-colors duration-300 hover:border-[#a84b32]">
                          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border border-[#a84b32]/20 bg-[#efe3d2] text-[#a84b32] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-[#a84b32] group-hover:text-[#fbf7ee]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7d6f5e]">
                              {item.label}
                            </p>
                            <p className="mt-1.5 text-[15px] font-bold leading-6 text-[#1e2a23]">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          className="relative overflow-hidden bg-[#4c6047] py-10 md:py-14"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8% 10%, rgba(251,247,238,0.1), transparent 38%), radial-gradient(circle at 95% 90%, rgba(30,42,35,0.2), transparent 50%)",
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-4 bottom-0 font-display text-[14rem] font-semibold leading-none text-[#fbf7ee]/[0.05] sm:text-[20rem]"
          >
            08
          </span>

          <div className="relative mx-auto max-w-7xl px-5">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
              <div className="lg:col-span-6">
                <Reveal>
                  <h2
                    aria-label="Speak with Boiler House Supplies"
                    className="mt-4 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#fbf7ee]"
                  >
                    Speak with
                    <span className="block text-[#f0b89f]">
                      Boiler House Supplies
                    </span>
                  </h2>
                  <HeadingUnderline tone="light" />

                  <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#eef1e8]/85">
                    Connect with our team for product details, availability and
                    business enquiries.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      to="/#contact"
                      className="group inline-flex items-center justify-center gap-2 bg-[#a84b32] px-7 py-4 text-sm font-bold text-[#fbf7ee] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8b3b26]"
                    >
                      Send an Enquiry
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/about/testimonials"
                      className="inline-flex items-center justify-center gap-2 border-2 border-[#fbf7ee]/60 px-7 py-4 text-sm font-bold text-[#fbf7ee] transition-colors duration-300 hover:bg-[#fbf7ee] hover:text-[#1e2a23]"
                    >
                      Read Customer Testimonials
                      <QuoteIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={100} className="lg:col-span-5 lg:col-start-8">
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -top-3 h-full w-full border border-[#f9e7dd]/30"
                  />

                  <div className="relative bg-[#a84b32] p-5 sm:p-7">
                    <dl className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="border-b border-[#fbf7ee]/25 py-4 first:pt-0">
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]/80">
                          Company CEO
                        </dt>
                        <dd className="mt-1.5 font-bold text-[#fbf7ee]">
                          Shubham Mundada
                        </dd>
                      </div>

                      <div className="border-b border-[#fbf7ee]/25 py-4 sm:pt-0 lg:pt-5">
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]/80">
                          Phone
                        </dt>
                        <dd className="mt-1.5">
                          <a
                            href="tel:+917942717334"
                            className="inline-flex items-center gap-2 font-bold text-[#fbf7ee] underline-offset-4 transition-colors duration-300 hover:text-[#f9e7dd] hover:underline"
                          >
                            <PhoneIcon className="h-4 w-4 text-[#f0b89f]" />
                            079427 17334
                          </a>
                        </dd>
                      </div>

                      <div className="border-b border-[#fbf7ee]/25 py-4">
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]/80">
                          Email
                        </dt>
                        <dd className="mt-1.5">
                          <a
                            href="mailto:info@boilerhouse.in"
                            className="inline-flex items-center gap-2 font-bold text-[#fbf7ee] underline-offset-4 transition-colors duration-300 hover:text-[#f9e7dd] hover:underline"
                          >
                            <MailIcon className="h-4 w-4 text-[#f0b89f]" />
                            info@boilerhouse.in
                          </a>
                        </dd>
                      </div>

                      <div className="border-b border-[#fbf7ee]/25 py-4">
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]/80">
                          Location
                        </dt>
                        <dd className="mt-1.5 flex items-start gap-2 leading-6 text-[#fbf7ee]">
                          <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-[#f0b89f]" />
                          Ahilyanagar 414111, Maharashtra, India
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
