import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal.jsx";

const companyStats = [
  {
    parts: [{ target: 2023 }],
    label: "Established Year",
  },
  {
    parts: [
      { target: 40, prefix: "₹", suffix: "L" },
      { text: " – " },
      { target: 1.5, prefix: "₹", suffix: "Cr", decimals: 1 },
    ],
    label: "Annual Turnover",
  },
  {
    parts: [{ target: 10, prefix: "Up to " }],
    label: "Team Members",
  },
  {
    parts: [{ target: 5 }],
    label: "Export Countries",
  },
];

function CountUp({ target, prefix = "", suffix = "", decimals = 0 }) {
  const elementRef = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      setValue(target);
      return undefined;
    }

    let frameId;
    let observer;
    const animate = () => {
      const startTime = performance.now();
      const duration = 2800;

      const update = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setValue(target * easedProgress);

        if (progress < 1) {
          frameId = requestAnimationFrame(update);
        } else {
          setValue(target);
        }
      };

      frameId = requestAnimationFrame(update);
    };

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (element) observer.observe(element);

    return () => {
      observer?.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target]);

  const roundedValue = Number(value.toFixed(decimals));

  return (
    <span ref={elementRef} aria-label={`${prefix}${target}${suffix}`}>
      {prefix}
      {roundedValue.toLocaleString("en-IN", {
        maximumFractionDigits: decimals,
        useGrouping: false,
      })}
      {suffix}
    </span>
  );
}

export default function PrideNumbers() {
  return (
    <section className="bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <h2 className="whitespace-nowrap text-center font-display text-[clamp(1.5rem,3vw,2.5rem)] font-semibold uppercase tracking-[0.005em] text-[#1e2a23]">
            We Take Pride in <span className="text-[#a84b32]">Our Numbers</span>
          </h2>
        </Reveal>

        <div className="mx-auto mt-7 grid max-w-6xl gap-x-3 gap-y-2 sm:grid-cols-2 lg:mt-9 lg:grid-cols-4 lg:gap-x-0">
          {companyStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 70}
              className={`pride-stat flex min-h-28 flex-col items-center justify-center border-b border-[#e7edf3] px-2 py-4 text-center sm:min-h-32 lg:min-h-28 lg:border-b-0 lg:px-3 lg:py-3 ${
                index > 0 ? "lg:border-l lg:border-[#e7edf3]" : ""
              }`}
            >
              <p
                className="whitespace-nowrap font-display text-[clamp(1.65rem,3vw,2.5rem)] font-semibold leading-none tracking-[0.005em] text-[#a84b32]"
              >
                {stat.parts.map((part, partIndex) =>
                  part.text ? (
                    <span key={`separator-${partIndex}`}>{part.text}</span>
                  ) : (
                    <CountUp
                      key={`${stat.label}-${partIndex}`}
                      target={part.target}
                      prefix={part.prefix}
                      suffix={part.suffix}
                      decimals={part.decimals}
                    />
                  ),
                )}
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-[#7d6f5e] sm:text-base">
                {stat.label}
              </p>
              <span
                aria-hidden="true"
                className="pride-stat-underline mt-4 h-[3px] rounded-full bg-[#a84b32]"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
