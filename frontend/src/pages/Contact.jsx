import { useState } from "react";
import api from "../api.js";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import Reveal from "../components/Reveal.jsx";
import {
  ArrowUpRightIcon,
  CheckIcon,
  MapPinIcon,
  SendIcon,
} from "../components/Icons.jsx";

const PHONE_DISPLAY = "079427 17334";
const PHONE_HREF = "tel:+917942717334";
const EMAIL = "info@boilerhouse.in";
const ADDRESS =
  "S No 91 A B C D, Plot No 72-73/8, Samrat Nagar, Wadgaon Gupta Road, Nav Nagapur, Kirti Beauty Parlour, Ahilyanagar - 414111, Ahmednagar, Maharashtra, India.";
const MAP_COORDINATES = "19.08032000,74.74481000";
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${MAP_COORDINATES}&z=16&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAP_COORDINATES}`;

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const FIELD_CLASS = "field text-base rounded-md bg-white/85";

const FIELD_ERROR_CLASS =
  "border-[#a33a2d] focus:border-[#a33a2d] focus:shadow-[0_0_0_3px_rgba(163,58,45,0.12)]";

function fullNameOf(values) {
  return [values.firstName, values.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function validate(values) {
  const errors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = "Please enter your first name.";
  } else if (firstName.length < 2) {
    errors.firstName = "Please enter at least 2 characters.";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const phone = values.phone.trim();
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else {
    const digits = phone.replace(/\D/g, "");
    const national =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : digits;

    if (!/^[6-9]\d{9}$/.test(national)) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }
  }

  const message = values.message.trim();
  if (!message) {
    errors.message = "Please write your message.";
  } else if (message.length < 10) {
    errors.message =
      "Please add a little more detail (at least 10 characters).";
  }

  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-xs leading-5 text-[#a33a2d]">
      {message}
    </p>
  );
}

export default function Contact() {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const errors = validate(values);
  const isFieldError = (field) =>
    Boolean((attempted || touched[field]) && errors[field]);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  }

  function handleChange(event) {
    setField(event.target.name, event.target.value);
  }

  function handleBlur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    setTouched({
      firstName: true,
      email: true,
      phone: true,
      message: true,
    });

    const currentErrors = validate(values);
    const firstInvalid = ["firstName", "email", "phone", "message"].find(
      (field) => currentErrors[field],
    );

    if (firstInvalid) {
      document.getElementById(`enquiry-${firstInvalid}`)?.focus();
      setStatus({ type: "idle", message: "" });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await api.post(
        "/enquiries",
        {
          name: fullNameOf(values),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          source: "website-contact-page",
        },
        { signal: controller.signal },
      );

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "We could not send your enquiry right now. Please try again.",
        );
      }

      setStatus({
        type: "success",
        message:
          "Thank you. Your enquiry has been sent successfully. Our team will get back to you shortly.",
      });
      setValues(initialValues);
      setTouched({});
      setAttempted(false);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          (error.name === "CanceledError"
            ? "The request timed out. Please try again, or call or email us directly."
            : "We could not send your enquiry right now. Please try again, or call or email us directly."),
      });
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <SiteHeader />

      <main>
        <section className="flex min-h-[138px] items-center justify-center bg-[#e5e5e5] px-5 py-8 sm:min-h-[160px]">
          <h1 className="font-sans text-4xl font-bold tracking-[-0.02em] text-black sm:text-5xl">
            Contact Us
          </h1>
        </section>

        <section className="relative isolate overflow-hidden bg-[#f9a4a4] py-8 sm:py-10 md:py-12">
          <img
            src="/contact-enquiry-background.png"
            alt=""
            aria-hidden="true"
            width="1600"
            height="900"
            fetchPriority="high"
            decoding="async"
            className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-full max-w-[920px] -translate-x-1/2 object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[920px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(224,196,151,0.68)_0%,rgba(250,229,199,0.76)_100%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-5">
            <header className="mx-auto mb-6 max-w-xl text-center text-white sm:mb-8">
              <h1 className="font-sans text-4xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
                Enquiries
              </h1>
              <p className="mt-2 text-sm text-white/90 sm:text-base">
                Fill this form to get more information
              </p>
            </header>

            <div className="mx-auto max-w-xl">
              <Reveal>
                <div className="rounded-sm border border-white/60 bg-[#fffdf8]/75 p-5 shadow-[0_26px_60px_-42px_rgba(10,24,38,0.55)] backdrop-blur-[3px] sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    Enquiry Form
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.03em] text-ink sm:text-[1.75rem]">
                    Send Us an Enquiry
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-steel">
                    Fill in the form below and we&rsquo;ll get back to you as
                    soon as possible.
                  </p>

                  <form
                    noValidate
                    onSubmit={handleSubmit}
                    className="mt-6 grid gap-4 border-t border-line/80 pt-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="enquiry-firstName"
                          className="field-label"
                        >
                          First Name <span className="text-brand">*</span>
                        </label>
                        <input
                          id="enquiry-firstName"
                          name="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={isFieldError("firstName")}
                          aria-describedby={
                            isFieldError("firstName")
                              ? "enquiry-firstName-error"
                              : undefined
                          }
                          className={`${FIELD_CLASS} ${
                            isFieldError("firstName") ? FIELD_ERROR_CLASS : ""
                          }`}
                          placeholder="First name"
                        />
                        <FieldError
                          id="enquiry-firstName-error"
                          message={
                            isFieldError("firstName") ? errors.firstName : ""
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="enquiry-lastName"
                          className="field-label"
                        >
                          Last Name
                        </label>
                        <input
                          id="enquiry-lastName"
                          name="lastName"
                          type="text"
                          autoComplete="family-name"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={FIELD_CLASS}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="enquiry-email" className="field-label">
                          Email Address <span className="text-brand">*</span>
                        </label>
                        <input
                          id="enquiry-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={isFieldError("email")}
                          aria-describedby={
                            isFieldError("email")
                              ? "enquiry-email-error"
                              : undefined
                          }
                          className={`${FIELD_CLASS} ${
                            isFieldError("email") ? FIELD_ERROR_CLASS : ""
                          }`}
                          placeholder="you@company.com"
                        />
                        <FieldError
                          id="enquiry-email-error"
                          message={isFieldError("email") ? errors.email : ""}
                        />
                      </div>

                      <div>
                        <label htmlFor="enquiry-phone" className="field-label">
                          Phone Number <span className="text-brand">*</span>
                        </label>
                        <input
                          id="enquiry-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          aria-invalid={isFieldError("phone")}
                          aria-describedby={
                            isFieldError("phone")
                              ? "enquiry-phone-error"
                              : undefined
                          }
                          className={`${FIELD_CLASS} ${
                            isFieldError("phone") ? FIELD_ERROR_CLASS : ""
                          }`}
                          placeholder="Phone number (10 digits)"
                        />
                        <FieldError
                          id="enquiry-phone-error"
                          message={isFieldError("phone") ? errors.phone : ""}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="enquiry-message" className="field-label">
                        Write a Message <span className="text-brand">*</span>
                      </label>
                      <textarea
                        id="enquiry-message"
                        name="message"
                        rows="5"
                        required
                        value={values.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-invalid={isFieldError("message")}
                        aria-describedby={
                          isFieldError("message")
                            ? "enquiry-message-error"
                            : undefined
                        }
                        className={`${FIELD_CLASS} resize-y ${
                          isFieldError("message") ? FIELD_ERROR_CLASS : ""
                        }`}
                        placeholder="Product name, size, quantity or application..."
                      />
                      <FieldError
                        id="enquiry-message-error"
                        message={isFieldError("message") ? errors.message : ""}
                      />
                    </div>

                    <div className="flex flex-col gap-4 border-t border-line/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full rounded-md disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {submitting ? "Sending Enquiry..." : "Submit Enquiry"}
                        <SendIcon className="h-4 w-4" />
                      </button>

                      <p className="max-w-xs text-[11px] leading-5 text-steel">
                        Fields marked <span className="text-brand">*</span> are
                        required.
                      </p>
                    </div>

                    <div aria-live="polite" className="grid gap-3">
                      {status.type === "success" && (
                        <div
                          role="status"
                          className="flex items-start gap-3 rounded-md border border-sage/35 bg-sage-soft px-4 py-3.5 text-sm leading-6 text-[#4d5f46]"
                        >
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>{status.message}</p>
                        </div>
                      )}

                      {status.type === "error" && (
                        <div
                          role="alert"
                          className="rounded-md border-l-2 border-[#a33a2d] bg-[#f8eeea] px-4 py-3.5 text-sm leading-6 text-[#7c3326]"
                        >
                          <p>{status.message}</p>
                          <p className="mt-1.5">
                            Call{" "}
                            <a
                              href={PHONE_HREF}
                              className="font-semibold underline underline-offset-2"
                            >
                              {PHONE_DISPLAY}
                            </a>{" "}
                            or email{" "}
                            <a
                              href={`mailto:${EMAIL}`}
                              className="font-semibold underline underline-offset-2"
                            >
                              {EMAIL}
                            </a>
                            .
                          </p>
                        </div>
                      )}

                    </div>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 4. Visit us */}
        <section className="border-y border-line bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:gap-10">
              <Reveal>
                <div className="flex h-full flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    Visit Us
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.03em] text-ink sm:text-4xl">
                    Visit Our Office
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-steel">
                    Meet our team at the Boiler House Supplies office in
                    Ahilyanagar.
                  </p>

                  <div className="mt-6 flex items-start gap-4 border-t border-line pt-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-paper text-brand">
                      <MapPinIcon className="h-4.5 w-4.5" />
                    </span>
                    <address className="text-sm not-italic leading-7 text-ink">
                      {ADDRESS}
                    </address>
                  </div>

                  <div className="mt-7">
                    <a
                      href={DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary rounded-md"
                    >
                      Get Directions
                      <ArrowUpRightIcon className="h-4 w-4" />
                    </a>
                    <p className="mt-3 text-[11px] leading-5 text-steel">
                      Opens the verified location in Google Maps in a new tab.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="relative min-h-[300px] overflow-hidden rounded-lg border border-line bg-paper sm:min-h-[340px] lg:h-full lg:min-h-[380px]">
                  <iframe
                    title="Map showing the Boiler House Supplies office in Ahilyanagar"
                    src={MAP_EMBED_URL}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
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
