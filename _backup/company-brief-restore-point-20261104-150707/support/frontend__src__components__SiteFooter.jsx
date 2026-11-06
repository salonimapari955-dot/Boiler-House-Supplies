import { Link } from "react-router-dom";
import { ArrowRightIcon, MailIcon, MapPinIcon, PhoneIcon } from "./Icons.jsx";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "Featured Products", to: "/#featured" },
  { label: "Customer Testimonials", to: "/about/testimonials" },
  { label: "Contact Us", to: "/#contact" },
];

const companyLinks = [
  { label: "Company Brief", to: "/about/company-brief" },
  { label: "Testimonials", to: "/about/testimonials" },
  { label: "Product Enquiry", to: "/#contact" },
  { label: "Complete Range", to: "/products" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-[#F5F1E8] text-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1.15fr] lg:gap-12">
        <div>
          <Link to="/" className="inline-flex max-w-full items-center">
            <img
              src="/company-logo-full.png"
              alt="Boiler House Supplies logo"
              width="792"
              height="664"
              loading="lazy"
              decoding="async"
              className="h-48 w-auto max-w-full object-contain mix-blend-darken"
            />
          </Link>

          <p className="mt-6 max-w-sm text-sm leading-7 text-ink"></p>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-ink">
            Explore
          </h3>
          <ul className="mt-5 grid gap-3 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-2 text-ink transition-colors duration-200 hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-ink">
            Company
          </h3>
          <ul className="mt-5 grid gap-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-2 text-ink transition-colors duration-200 hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-ink">
            Contact
          </h3>

          <ul className="mt-5 grid gap-4 text-sm">
            <li>
              <a
                href="tel:+917942717334"
                className="group flex items-start gap-3 text-ink transition-colors hover:text-brand"
              >
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#565f68]">
                    Call
                  </span>
                  079427 17334
                </span>
              </a>
            </li>
            <li>
              <a
                href="mailto:info@boilerhouse.in"
                className="group flex items-start gap-3 text-ink transition-colors hover:text-brand"
              >
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#565f68]">
                    Email
                  </span>
                  info@boilerhouse.in
                </span>
              </a>
            </li>
            <li className="flex items-start gap-3 text-ink">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#565f68]">
                  Address
                </span>
                S No 91 A B C D, Plot No 72-73/8, Samrat Nagar, Wadgaon Gupta
                Road, Ahilyanagar 414111, Maharashtra, India
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-[#414a54] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Boiler House Supplies. All rights reserved.</p>
          <p className="tracking-wide">
            Ahilyanagar, Maharashtra · Industrial Boiler Components
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 self-end font-medium text-[#414a54] underline-offset-4 transition-colors duration-200 hover:text-brand hover:underline sm:self-auto"
          >
            Admin Login
            <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
