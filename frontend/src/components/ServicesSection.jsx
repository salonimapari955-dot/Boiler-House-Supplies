import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";

const services = [
  {
    title: "Boiler Mountings",
    description:
      "Safety valves, pressure gauges and water level indicators for boiler house assemblies.",
    icon: "⚙️",
    to: "/products",
  },
  {
    title: "Castings & Grate Parts",
    description:
      "Boiler castings, grate bars and fire bars built for demanding operating conditions.",
    icon: "🧱",
    to: "/products",
  },
  {
    title: "Industrial Valves",
    description:
      "Steam, feed water and process valves suited to industrial pressure and temperature.",
    icon: "🔧",
    to: "/products",
  },
  {
    title: "Refractory Products",
    description:
      "Fire bricks, castables and insulation for boiler linings and heat containment.",
    icon: "🏭",
    to: "/products",
  },
];

function ServicesPattern() {
  return (
    <div
      className="services-backdrop pointer-events-none absolute inset-0 overflow-hidden text-[#b8b8b8]"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 560"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern id="services-stripes" width="28" height="80" patternUnits="userSpaceOnUse">
            <path d="M5 0v80M15 0v80M25 0v80" opacity="0.32" />
            <path d="M5 17v8M15 50v12M25 29v7" strokeWidth="8" opacity="0.28" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#services-stripes)" />
        <g opacity="0.45" strokeWidth="5">
          <path d="M385 -30 C385 105 410 120 465 150 C520 180 560 195 560 245 C560 300 500 320 450 355 C400 390 385 430 385 590" />
          <path d="M365 -30 C365 115 390 135 448 165 C495 190 535 208 535 245 C535 285 485 305 435 340 C380 378 365 425 365 590" />
          <path d="M345 -30 C345 125 372 150 430 180 C475 205 510 220 510 245 C510 273 468 292 418 325 C360 365 345 420 345 590" />
          <path d="M615 -30 C615 105 590 120 535 150 C480 180 440 195 440 245 C440 300 500 320 550 355 C600 390 615 430 615 590" />
          <path d="M635 -30 C635 115 610 135 552 165 C505 190 465 208 465 245 C465 285 515 305 565 340 C620 378 635 425 635 590" />
          <path d="M655 -30 C655 125 628 150 570 180 C525 205 490 220 490 245 C490 273 532 292 582 325 C640 365 655 420 655 590" />
        </g>
      </svg>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="services-overlap">
      <div className="services-tab">
        <div className="flex items-center justify-center gap-5 px-5 py-4 sm:gap-7 sm:px-8">
          <span className="h-px flex-1 bg-[#dcdcdc]" aria-hidden="true" />
          <p className="whitespace-nowrap text-[clamp(1.5rem,2.7vw,2.1rem)] font-bold leading-[1.1] tracking-[0.01em] text-[#555555]">
            What We Supply
          </p>
          <span className="h-px flex-1 bg-[#dcdcdc]" aria-hidden="true" />
        </div>
      </div>

      <div className="services-sheet pb-8 pt-14 sm:pt-16 lg:pb-10 lg:pt-20">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#e2e2e2]"
          aria-hidden="true"
        />

        <ServicesPattern />

        <div className="relative z-10 mx-auto max-w-[1180px] px-5">
          <Reveal className="services-reveal" waitForUserScroll>
            <div className="text-center">
              <p className="mx-auto mt-1 text-[1rem] leading-[1.5] text-[#666666] sm:text-[1.05rem]">
                We supply the following products : 
              </p>
              <span className="mx-auto mt-3 flex max-w-[360px] items-center gap-3" aria-hidden="true">
                <span className="h-1 w-12 rounded-full bg-[#dddddd]" />
                <span className="h-1 flex-1 rounded-full bg-[#dddddd]" />
                <span className="h-1 w-6 rounded-full bg-[#dddddd]" />
                <span className="h-1 flex-1 rounded-full bg-[#dddddd]" />
              </span>
            </div>
          </Reveal>

          <div className="mt-5 grid grid-cols-1 gap-y-7 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 lg:mt-5 lg:grid-cols-3 lg:gap-x-0 lg:gap-y-3">
            {services.map((service, index) => {
              return (
                <Reveal
                  key={service.title}
                  delay={index * 25}
                  className={`services-reveal h-full ${
                    index === 1 || index === 2
                      ? "lg:border-l lg:border-[#e5e5e5]"
                      : ""
                  } ${index === 3 ? "lg:col-start-2 lg:row-start-2 lg:border-l lg:border-[#e5e5e5]" : ""}`}
                  waitForUserScroll
                >
                  <Link
                    to={service.to}
                    className="group flex h-full flex-col items-center px-4 py-2 text-center lg:px-8"
                  >
                    <span className="flex h-24 w-24 items-center justify-center text-[4.75rem] leading-none transition-transform duration-300 group-hover:scale-110 sm:h-28 sm:w-28 sm:text-[5.25rem]">
                      {service.icon}
                    </span>

                    <h3 className="mt-2 max-w-[290px] text-[1.1rem] font-extrabold leading-[1.45] text-[#555555] transition-colors duration-300 group-hover:text-[#a84b32] sm:text-[1.2rem]">
                      {service.title}
                    </h3>

                    <p className="mt-1.5 max-w-[290px] text-[0.875rem] leading-[1.65] text-[#666666]">
                      {service.description}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
