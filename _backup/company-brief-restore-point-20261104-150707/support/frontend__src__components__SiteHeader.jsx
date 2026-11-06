import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  PhoneIcon,
} from "./Icons.jsx";

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
    match: (pathname, hash) =>
      (pathname === "/" && hash === "#about") ||
      pathname.startsWith("/about"),
    children: [
      { label: "Company Brief", to: "/about/company-brief" },
      { label: "Testimonials", to: "/about/testimonials" },
    ],
  },
  {
    label: "Products",
    to: "/products",
    match: (pathname) => pathname.startsWith("/products"),
  },
  {
    label: "Contact Us",
    to: "/contact",
    match: (pathname) => pathname === "/contact",
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-paper-deep bg-white">
      <div className="h-0.5 bg-gradient-to-r from-brand via-brand-bright to-transparent" />

      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-2.5"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
        >
          <img
            src="/company-logo-full.png"
            alt="Boiler House Supplies logo"
            width="792"
            height="664"
            className="h-12 w-auto object-contain sm:h-14 lg:h-[72px]"
          />
          <span
            className="hidden h-8 w-px shrink-0 bg-line sm:block"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap font-display text-[0.9rem] font-semibold uppercase leading-none tracking-[0.08em] text-ink sm:text-[1.05rem] lg:text-[1.3rem]">
            Boiler House <span className="text-brand">Supplies</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active = item.match(location.pathname, location.hash);
            const hasChildren = Boolean(item.children?.length);

            return (
              <div key={item.label} className="group relative">
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`group relative inline-flex items-center py-2 text-[0.82rem] font-semibold tracking-wide transition-colors duration-200 ${
                    active
                      ? "text-ink"
                      : "text-ink hover:text-brand"
                  }`}
                >
                  {item.label}
                  {hasChildren ? (
                    <ChevronDownIcon className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                  ) : null}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-brand transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>

                {hasChildren ? (
                  <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="border border-line bg-white shadow-[0_28px_55px_-30px_rgba(10,24,38,0.55)]">
                      <span
                        className="block h-0.5 bg-brand"
                        aria-hidden="true"
                      />
                      {item.children.map((child) => {
                        const childActive =
                          location.pathname === child.to;

                        return (
                          <Link
                            key={child.label}
                            to={child.to}
                            aria-current={childActive ? "page" : undefined}
                            className={`block border-b border-line px-4 py-3 text-xs font-semibold tracking-wide transition-colors duration-200 last:border-b-0 hover:bg-paper hover:text-brand ${
                              childActive ? "text-brand" : "text-ink"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors duration-200 hover:border-brand hover:text-brand lg:hidden"
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
          className="border-t border-paper-deep bg-white px-5 pb-6 pt-3 shadow-[0_18px_40px_-28px_rgba(10,24,38,0.35)] lg:hidden"
        >
          <div className="grid">
            {navigation.map((item) => {
              const active = item.match(location.pathname, location.hash);

              return (
                <div key={item.label} className="grid">
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between border-b border-paper-deep px-1 py-4 text-sm font-semibold transition-colors duration-200 ${
                      active
                        ? "text-brand"
                        : "text-ink hover:text-brand"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="h-0.5 w-6 bg-brand" aria-hidden="true" />
                    )}
                  </Link>

                  {item.children?.length ? (
                    <div className="grid pl-4">
                      {item.children.map((child) => {
                        const childActive =
                          location.pathname === child.to;

                        return (
                          <Link
                            key={child.label}
                            to={child.to}
                            onClick={() => setMenuOpen(false)}
                            aria-current={childActive ? "page" : undefined}
                            className={`flex items-center justify-between border-b border-paper-deep px-1 py-3 text-xs font-semibold tracking-wide transition-colors duration-200 ${
                              childActive
                                ? "text-brand"
                                : "text-steel hover:text-brand"
                            }`}
                          >
                            {child.label}
                            {childActive && (
                              <span
                                className="h-0.5 w-4 bg-brand"
                                aria-hidden="true"
                              />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <a
            href="tel:+917942717334"
            onClick={() => setMenuOpen(false)}
            className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-steel transition-colors duration-200 hover:text-brand"
          >
            <PhoneIcon className="h-4 w-4" />
            Call 079427 17334
          </a>
        </div>
      )}
    </header>
  );
}
