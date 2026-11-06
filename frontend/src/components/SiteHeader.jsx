import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
} from "./Icons.jsx";

const trustSealCertificate = "/assets/boiler-house-supplies-trust-profile.pdf";

const navigation = [
  {
    label: "Home",
    icon: "home",
    to: "/#home",
    match: (pathname, hash) =>
      pathname === "/" && (!hash || hash === "#home"),
  },
  {
    label: "About Us",
    icon: "users",
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
    icon: "package",
    to: "/products",
    match: (pathname) => pathname.startsWith("/products"),
  },
  {
    label: "Contact Us",
    icon: "phone",
    to: "/contact",
    match: (pathname) => pathname === "/contact",
  },
];

function NavigationIcon({ name }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
      </>
    ),
    users: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20v-1a7 7 0 0 1 14 0v1z" />
        <path d="M5.2 6.5a2.5 2.5 0 0 0 0 5M2 18v-1a5 5 0 0 1 2-4" />
        <path d="M18.8 6.5a2.5 2.5 0 0 1 0 5M22 18v-1a5 5 0 0 0-2-4" />
      </>
    ),
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" />
      </>
    ),
    phone: (
      <path d="M7.2 3.5h2.5l1.5 5-2.1 1.5a15 15 0 0 0 5.9 5.9l1.5-2.1 5 1.5v2.5a2 2 0 0 1-2.2 2A17 17 0 0 1 5.2 5.7a2 2 0 0 1 2-2.2Z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 shrink-0"
      fill={name === "users" || name === "home" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-paper-deep bg-white">
      <div className="h-0.5 bg-gradient-to-r from-brand via-brand-bright to-transparent" />

      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-2.5"
        aria-label="Main navigation"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-6">
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
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          <a
            href={trustSealCertificate}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View IndiaMART TrustSEAL certificate (opens in a new tab)"
            title="View IndiaMART TrustSEAL certificate (opens in a new tab)"
            className="group shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <img
              src="/assets/indiamart-trustseal.png"
              alt="IndiaMART TrustSEAL certified supplier"
              width="102"
              height="90"
              className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </a>
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

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={trustSealCertificate}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View IndiaMART TrustSEAL certificate (opens in a new tab)"
            title="View IndiaMART TrustSEAL certificate (opens in a new tab)"
            className="group shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <img
              src="/assets/indiamart-trustseal.png"
              alt="IndiaMART TrustSEAL certified supplier"
              width="102"
              height="90"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors duration-200 hover:border-brand hover:text-brand"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#efe8e1]/95 p-6 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="relative h-[calc(100dvh-3.75rem)] min-h-[420px] w-full max-w-[370px] overflow-hidden border border-[#ded8d2] bg-white px-5 pb-10 pt-[15vh] sm:px-7"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 400 230"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-0 top-0 h-[34%] w-[76%]"
            >
              <path
                d="M0 0h400C333 70 245 92 158 104 86 114 33 151 0 230Z"
                fill="#ff8a24"
              />
              <path
                d="M0 0h285c-35 48-91 70-155 91C69 113 28 142 0 183Z"
                fill="#f06400"
              />
            </svg>
            <svg
              aria-hidden="true"
              viewBox="0 0 400 230"
              preserveAspectRatio="none"
              className="pointer-events-none absolute bottom-0 right-0 h-[26%] w-[72%] rotate-180"
            >
              <path
                d="M0 0h400C333 70 245 92 158 104 86 114 33 151 0 230Z"
                fill="#ff8a24"
              />
              <path
                d="M0 0h285c-35 48-91 70-155 91C69 113 28 142 0 183Z"
                fill="#f06400"
              />
            </svg>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-brand"
              aria-label="Close menu"
            >
              <CloseIcon className="h-7 w-7" />
            </button>

            <nav className="relative z-10 flex flex-col" aria-label="Mobile navigation">
              {navigation.map((item) => {
                const active = item.match(location.pathname, location.hash);
                const childrenExpanded = expandedMobileItem === item.label;

                return (
                  <div
                    key={item.label}
                    className="border-b border-[#e8eaf0] last:border-b-0"
                  >
                    <div
                      className={`flex min-h-[72px] items-center gap-4 rounded-2xl px-4 transition-colors ${
                        active ? "bg-[#fff0e6] text-brand" : "text-ink"
                      }`}
                    >
                      {item.children?.length ? (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedMobileItem(
                              childrenExpanded ? "" : item.label,
                            );
                          }}
                          aria-expanded={childrenExpanded}
                          className="flex min-h-[72px] min-w-0 flex-1 items-center gap-5 text-left text-[19px] font-medium leading-7 transition-colors duration-200 hover:text-brand"
                        >
                          <NavigationIcon name={item.icon} />
                          <span className="flex-1">{item.label}</span>
                          <ChevronDownIcon
                            className={`mr-1 h-4 w-4 shrink-0 transition-transform ${
                              childrenExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className="flex min-h-[72px] min-w-0 flex-1 items-center gap-5 text-[19px] font-medium leading-7 transition-colors duration-200 hover:text-brand"
                        >
                          <NavigationIcon name={item.icon} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </div>

                    {item.children?.length && childrenExpanded ? (
                      <div className="mb-3 ml-[4.25rem] border-l border-[#f2b99b] pl-4">
                        {item.children.map((child) => {
                          const childActive =
                            location.pathname === child.to;

                          return (
                            <Link
                              key={child.label}
                              to={child.to}
                              onClick={() => setMenuOpen(false)}
                              aria-current={childActive ? "page" : undefined}
                              className={`flex min-h-12 items-center text-base font-semibold transition-colors duration-200 ${
                                childActive
                                  ? "text-brand"
                                  : "text-steel hover:text-brand"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
