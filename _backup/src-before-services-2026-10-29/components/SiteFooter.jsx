import { Link } from "react-router-dom";
import {
  ArrowUpRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "./Icons.jsx";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "All Products", to: "/products" },
  { label: "Featured Products", to: "/#featured" },
  { label: "Customer Reviews", to: "/#reviews" },
  { label: "Contact Us", to: "/#contact" },
];

const companyLinks = [
  { label: "About Boiler House", to: "/#about" },
  { label: "Product Enquiry", to: "/#contact" },
  { label: "Share Your Review", to: "/#reviews" },
  { label: "Complete Range", to: "/products" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#07111c] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1.15fr] lg:gap-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-brand/50 bg-brand font-display text-xl font-semibold tracking-[0.08em] text-white">
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

          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
            Retailer, trader and importer of boiler castings, boiler mountings
            and industrial boiler components. Serving industrial buyers from
            Ahilyanagar, Maharashtra since 2023.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium tracking-wide text-slate-300">
            <ShieldCheckIcon className="h-4 w-4 text-brand-bright" />
            GST 27ABBFB3295L1Z6
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-white">
            Explore
          </h3>
          <ul className="mt-5 grid gap-3 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-brand-bright"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-white">
            Company
          </h3>
          <ul className="mt-5 grid gap-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-2 text-slate-400 transition-colors duration-200 hover:text-brand-bright"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-white">
            Contact
          </h3>

          <ul className="mt-5 grid gap-4 text-sm">
            <li>
              <a
                href="tel:+917942717334"
                className="group flex items-start gap-3 text-slate-400 transition-colors hover:text-white"
              >
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" />
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Call
                  </span>
                  079427 17334
                </span>
              </a>
            </li>
            <li>
              <a
                href="mailto:info@boilerhouse.in"
                className="group flex items-start gap-3 text-slate-400 transition-colors hover:text-white"
              >
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" />
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </span>
                  info@boilerhouse.in
                </span>
              </a>
            </li>
            <li className="flex items-start gap-3 text-slate-400">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" />
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Address
                </span>
                S No 91 A B C D, Plot No 72-73/8, Samrat Nagar, Wadgaon Gupta
                Road, Ahilyanagar 414111, Maharashtra, India
              </span>
            </li>
          </ul>

          <Link
            to="/#contact"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-bright transition-colors hover:text-white"
          >
            Send an Enquiry
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Boiler House Supplies. All rights reserved.
          </p>
          <p className="tracking-wide">
            Ahilyanagar, Maharashtra · Industrial Boiler Components
          </p>
        </div>
      </div>
    </footer>
  );
}
