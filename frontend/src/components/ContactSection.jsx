import { useState } from "react";
import Reveal from "./Reveal.jsx";
import {
  ArrowUpRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
  ShieldCheckIcon,
} from "./Icons.jsx";

const CONTACT_EMAIL = "info@boilerhouse.in";
const CONTACT_PHONE_DISPLAY = "079427 17334";
const CONTACT_PHONE_LINK = "tel:+917942717334";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const subject = `Product enquiry from ${form.name || "website visitor"}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      "",
      "Requirement:",
      form.message,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setStatus(
      "Your email app should open with the enquiry ready to send. If it does not, email us directly.",
    );
  }

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 bg-paper-deep py-20 md:py-28"
    >
      <span id="about" className="block scroll-mt-28" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
              <span className="h-px w-8 bg-brand" />
              About &amp; Contact
            </p>

            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold uppercase leading-[0.98] tracking-[0.02em] text-ink sm:text-5xl">
              Supplying the boiler house,
              <span className="text-brand"> from castings to mountings.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-steel sm:text-base">
              Established in 2023, Boiler House Supplies is a retailer, trader
              and importer of boiler castings, boiler mountings and large
              boiler castings. From Ahilyanagar, Maharashtra, we support
              industrial buyers with components for boiler and steam
              applications.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-7 text-steel">
              Share your specification or part requirement and our team will
              help with availability, product details and pricing.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 border border-line bg-white/70 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center bg-brand/10 text-brand">
                <ShieldCheckIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
                  GST registered
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  27ABBFB3295L1Z6
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href={CONTACT_PHONE_LINK}
                className="group border border-line bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"
              >
                <PhoneIcon className="h-5 w-5 text-brand" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
                  Call us
                </p>
                <p className="mt-1 text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                  {CONTACT_PHONE_DISPLAY}
                </p>
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group border border-line bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"
              >
                <MailIcon className="h-5 w-5 text-brand" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
                  Email
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                  {CONTACT_EMAIL}
                </p>
              </a>

              <div className="border border-line bg-white p-5 sm:col-span-2">
                <MapPinIcon className="h-5 w-5 text-brand" />
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
                  Address
                </p>
                <p className="mt-1 text-sm leading-7 text-ink">
                  S No 91 A B C D, Plot No 72-73/8, Samrat Nagar, Wadgaon Gupta
                  Road, Nav Nagapur, Ahilyanagar 414111, Maharashtra, India
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-steel">
              Contact person:{" "}
              <span className="font-semibold text-ink">Shubham Mundada</span>,
              CEO
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-line bg-white shadow-[0_30px_70px_-40px_rgba(10,24,38,0.45)]">
              <div className="h-1 bg-gradient-to-r from-brand via-brand-bright to-transparent" />

              <div className="p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                  Product Enquiry
                </p>
                <h3 className="mt-3 font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink">
                  Tell us what you need
                </h3>
                <p className="mt-2 text-sm leading-6 text-steel">
                  Include the product, size or application and we will get back
                  to you with the relevant details.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="field-label">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="field"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="field-label">
                        Phone <span className="font-normal">(optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="field"
                        placeholder="Your contact number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="field-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="field"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="field-label">
                      Requirement
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="field resize-y"
                      placeholder="Product, size, quantity or application..."
                    />
                  </div>

                  <button type="submit" className="btn-primary mt-1 w-full">
                    Send Enquiry
                    <SendIcon className="h-4 w-4" />
                  </button>

                  <p className="text-center text-[11px] leading-5 text-steel">
                    This form opens your email app with the enquiry ready to
                    send. No information is stored on this website.
                  </p>

                  {status && (
                    <p
                      role="status"
                      className="border border-brand/20 bg-brand/5 px-3 py-2.5 text-center text-xs leading-6 text-brand"
                    >
                      {status}{" "}
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                      >
                        {CONTACT_EMAIL}
                        <ArrowUpRightIcon className="h-3 w-3" />
                      </a>
                    </p>
                  )}
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
