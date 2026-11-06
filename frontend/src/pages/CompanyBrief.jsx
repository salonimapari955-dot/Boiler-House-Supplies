import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import BackToTopButton from "../components/BackToTopButton.jsx";
import Reveal from "../components/Reveal.jsx";
import {
  ArrowRightIcon,
  BankIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  QuoteIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
} from "../components/Icons.jsx";

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
  const swipeTimeRef = useRef(false);
  const showSlide = (offset) => {
    setActiveIndex(
      (current) => (current + offset + gallery.length) % gallery.length,
    );
  };

  const handleImageClick = (index) => {
    // A swipe also emits a click; ignore that click once.
    if (swipeTimeRef.current) {
      swipeTimeRef.current = false;
      return;
    }
    setActiveIndex(index);
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
    swipeTimeRef.current = false;
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

    swipeTimeRef.current = true;
    showSlide(deltaX < 0 ? 1 : -1);
  };

  return (
    <div className="company-brief min-h-screen bg-[#faf6ee] font-sans text-[#1e2a23]">
      <SiteHeader />

      <main>
        {/* Our Mission */}
        <section
          id="company-profile"
          className="company-brief-mission relative isolate scroll-mt-24 overflow-hidden bg-[#404040]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center bg-scroll opacity-20 md:bg-fixed"
            style={{
              backgroundImage: "url('/company/boiler-house-steam-plant.jpg')",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#404040]/30"
          />

          <div className="relative mx-auto flex min-h-[clamp(32rem,68vh,42rem)] w-full flex-col justify-center px-[clamp(1.25rem,4.9vw,5rem)] py-16 md:justify-start md:pt-[4.25rem] md:pb-16">
            <Reveal>
              <h1 className="max-w-4xl font-sans text-[clamp(2.8rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[#fafafa]">
                Our Mission
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-4 max-w-[49rem] space-y-5">
                <p className="text-[19px] leading-[1.6] text-white">
                  Boiler House Supplies is a retailer, trader and importer of
                  boiler castings, boiler mountings, large boiler castings and
                  many more. The company operates from Ahilyanagar,
                  Maharashtra, and follows moral business policies and crystal
                  pure transparency in all transactions.
                </p>
                <p className="text-[19px] leading-[1.6] text-white">
                  Every activity is directed towards catering to customer
                  expectations with excellent quality products while maintaining
                  healthy, long-term customer relationships.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Our Story */}
        <section className="company-brief-story relative z-20 -mt-[2px] sm:-mt-[18px] lg:-mt-[55px]">
          <div className="mx-auto grid w-full border border-black/30 bg-white lg:max-w-[86rem] lg:grid-cols-[40%_60%]">
            <Reveal
              variant="image"
              className="relative h-full overflow-hidden bg-[#e6dbc9]"
            >
              <figure className="relative h-full">
                <img
                  src="/company/boiler-house-industrial-boiler.jpg"
                  alt="Boiler House Supplies pulsating grate bar"
                  width="1000"
                  height="562"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[20rem]"
                />
                <figcaption className="absolute bottom-0 left-0 bg-[#1e2a23]/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#fbf7ee]">
                  Boiler Castings
                </figcaption>
              </figure>
            </Reveal>

            <div className="flex flex-col justify-center bg-white px-5 py-3 sm:px-8 sm:py-5 lg:justify-center lg:px-10 lg:py-5 xl:px-12">
              <Reveal>
                <h2 className="text-center font-sans text-[clamp(1.625rem,2.5vw,1.875rem)] font-bold leading-tight text-[#1e2a23]">
                  Our Story
                </h2>
              </Reveal>

              <div className="mt-5 space-y-3">
                {commitments.map((item, index) => (
                  <Reveal key={item.title} delay={index * 80}>
                    <p className="text-[16px] leading-[1.8] text-[#404040]">
                      <span className="font-bold text-[#1e2a23]">
                        {item.title}.
                      </span>{" "}
                      {item.body}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Company facts */}
        <section
          className="relative mt-4 overflow-hidden bg-[#a84b32] py-4 md:py-5"
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
            <div className="grid gap-4 border-b border-[#fbf7ee]/30 pb-3 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-7">
                <h2 className="mt-2 font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#fbf7ee]">
                  The essentials
                </h2>
                <HeadingUnderline tone="light" />
              </Reveal>
            </div>

            <div className="mt-4 grid gap-y-4 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
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
                      <p className="mt-2 break-words font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[0.86] tracking-[0.005em] text-[#fbf7ee]">
                        {item.value}
                      </p>
                      {item.note ? (
                        <p className="mt-2 max-w-[15rem] text-xs leading-5 text-[#f9e7dd]">
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
              <div className="mt-5 flex flex-col gap-3 border-t border-[#fbf7ee]/30 pt-4 lg:flex-row lg:items-center lg:justify-between">
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

        {/* Vendor base & trade profile */}
        <section className="relative overflow-hidden bg-[#faf6ee] py-4 md:py-6">
          <div className="mx-auto grid w-full border border-black/30 bg-white lg:max-w-[86rem] lg:grid-cols-[60%_40%]">
            <div className="flex flex-col justify-center px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-4 xl:px-12">
              <div>
                <Reveal>
                  <h2
                    aria-label="Trade and market profile"
                    className="font-display text-[clamp(2.4rem,4.2vw,3.8rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                  >
                    Trade &amp; market
                    <span className="block text-[#a84b32]">profile</span>
                  </h2>
                  <HeadingUnderline />
                </Reveal>

                <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
                  {tradeProfile.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Reveal key={item.label} delay={index * 40}>
                        <div className="group flex items-start gap-4 border-t border-[#d3c3ae] py-2.5 transition-colors duration-300 hover:border-[#a84b32]">
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

            <Reveal
              variant="image"
              className="relative h-full overflow-hidden bg-[#e6dbc9]"
            >
              <figure className="relative h-full">
                <img
                  src="/company/boiler-house-trade-export.jpg"
                  alt="Boiler House Supplies vendor base"
                  width="1000"
                  height="432"
                  loading="lazy"
                  decoding="async"
                  className="cb-zoom aspect-[2/1] w-full object-cover lg:aspect-auto lg:h-full lg:min-h-[16rem]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 bg-[#a84b32]/95 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#fbf7ee]">
                  <span>Our Vendor Base</span>
                  <span className="text-[#f9e7dd]">
                    Major Market · World Wide
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* Gallery */}
        <section className="relative overflow-hidden bg-[#faf6ee] py-8 md:py-10">
          <div className="relative mx-auto max-w-7xl px-5">
            <Reveal>
              <SectionRule />
            </Reveal>

            <div className="mt-6 text-center">
              <Reveal>
                <h2
                  aria-label="Inside Boiler House Supplies"
                  className="font-display text-[clamp(2rem,3.5vw,3rem)] font-semibold uppercase leading-[0.95] tracking-[0.005em] text-[#1e2a23]"
                >
                  Inside Boiler House <span className="text-[#a84b32]">Supplies</span>
                </h2>
                <div className="mx-auto w-fit">
                  <HeadingUnderline />
                </div>
              </Reveal>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <Reveal key={image.src} variant="image" delay={index * 70}>
                  <article
                    className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                      index === activeIndex
                        ? "border-[#a84b32]/60"
                        : "border-[#1e2a23]/10"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleImageClick(index)}
                      onKeyDown={handleKeyDown}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      aria-label={`Show ${image.caption}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                      className="group block w-full cursor-pointer touch-pan-y text-left"
                    >
                      <span className="block aspect-[4/3] overflow-hidden bg-[#e6dbc9]">
                        <img
                          src={image.src}
                          alt={image.alt}
                          width={image.width}
                          height={image.height}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="cb-zoom h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </span>
                      <span className="block px-4 py-3">
                        <span className="block font-display text-lg font-semibold uppercase tracking-wide text-[#1e2a23]">
                          {image.caption}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a6a58]">
                          {image.location}
                        </span>
                      </span>
                    </button>
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => showSlide(-1)}
                aria-label="Show the previous company photograph"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b7a0] text-[#1e2a23] transition-colors duration-300 hover:border-[#a84b32] hover:bg-[#a84b32] hover:text-[#fbf7ee]"
              >
                <ArrowRightIcon className="h-4 w-4 rotate-180" />
              </button>
              <span
                aria-live="polite"
                aria-atomic="true"
                className="min-w-24 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-[#7a6a58]"
              >
                Photograph {activeIndex + 1} / {gallery.length}
              </span>
              <button
                type="button"
                onClick={() => showSlide(1)}
                aria-label="Show the next company photograph"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b7a0] text-[#1e2a23] transition-colors duration-300 hover:border-[#a84b32] hover:bg-[#a84b32] hover:text-[#fbf7ee]"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Factsheet */}
        <section
          id="factsheet"
          className="relative scroll-mt-24 overflow-hidden bg-[#f3e9db] py-8 md:py-10"
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

            <div className="mt-5 grid gap-4 border-b-2 border-[#1e2a23] pb-4 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-5">
                <h2
                  aria-label="Company factsheet"
                  className="mt-2 font-display text-[clamp(2rem,3.5vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[0.005em] text-[#1e2a23]"
                >
                  Company <span className="text-[#a84b32]">factsheet</span>
                </h2>
                <HeadingUnderline />
              </Reveal>
            </div>

            <dl className="mt-1 grid lg:grid-cols-2 lg:gap-x-20">
              {factsheet.map((item, index) => (
                <Reveal key={item.label} delay={(index % 4) * 50}>
                  <div className="group grid gap-2 border-b border-[#d3c3ae] py-3 transition-colors duration-300 hover:bg-[#fbf7ee] sm:grid-cols-[12rem_1fr] sm:gap-4 sm:px-2">
                    <dt className="flex items-start gap-2 text-[10px] font-bold uppercase leading-5 tracking-[0.16em] text-[#a84b32]">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a84b32] transition-transform duration-300 group-hover:rotate-0"
                      />
                      {item.label}
                    </dt>
                    <dd className="text-[14px] font-semibold leading-6 text-[#1e2a23]">
                      {item.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>
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
      <BackToTopButton />
    </div>
  );
}
