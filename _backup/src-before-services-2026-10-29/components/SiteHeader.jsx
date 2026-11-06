import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CloseIcon, MenuIcon, PhoneIcon } from "./Icons.jsx";

const navigation = [
  {
    label: "Home",
    to: "/#home",
    match: (pathname, hash) =>
      pathname === "/" && (!hash || hash === "#home"),
  },
  {
    label: "About Us",
    to: "/#about",
    match: (pathname, hash) => pathname === "/" && hash === "#about",
  },
  {
    label: "Products",
    to: "/products",
    match: (pathname) => pathname.startsWith("/products"),
  },
  {
    label: "Contact Us",
    to: "/#contact",
    match: (pathname, hash) => pathname === "/" && hash === "#contact",
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="h-0.5 bg-gradient-to-r from-brand via-brand-bright to-transparent" />

      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 lg:py-4"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="group flex shrink-0 items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center border border-brand/50 bg-brand font-display text-xl font-semibold tracking-[0.08em] text-white transition-colors duration-300 group-hover:bg-brand-bright">
            BH
          </span>
          <span className="leading-none">
            <span className="block font-display text-[1.35rem] font-semibold uppercase tracking-[0.1em] text-white">
              Boiler House
            </span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.34em] text-brand-bright">
              Supplies
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active = item.match(location.pathname, location.hash);

            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={`group relative py-2 text-[0.82rem] font-semibold tracking-wide transition-colors duration-200 ${
                  active
                    ? "text-white"
                    : "text-slate-300 hover:text-brand-bright"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-colors duration-200 hover:border-brand hover:text-brand-bright lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-ink px-5 pb-6 pt-3 lg:hidden"
        >
          <div className="grid">
            {navigation.map((item) => {
              const active = item.match(location.pathname, location.hash);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between border-b border-white/10 px-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                    active
                      ? "text-brand-bright"
                      : "text-slate-200 hover:text-brand-bright"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>

          <a
            href="tel:+917942717334"
            onClick={() => setMenuOpen(false)}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 transition-colors duration-200 hover:text-brand-bright"
          >
            <PhoneIcon className="h-4 w-4" />
            Call 079427 17334
          </a>
        </div>
      )}
    </header>
  );
}
