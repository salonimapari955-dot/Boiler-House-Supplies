import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";
import "flag-icons/css/flag-icons.min.css";
import api from "../api.js";
import { formatPriceWithUnit, getUnit } from "../lib/productCatalog.js";
import { CheckIcon, CloseIcon, PackageIcon } from "./Icons.jsx";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryFlag(countryCode) {
  const flagCode = { AC: "GB", TA: "GB" }[countryCode] || countryCode;
  return `fi-${flagCode.toLowerCase()}`;
}

const COUNTRIES = getCountries()
  .map((code) => ({
    code,
    name: countryNames.of(code) || code,
    dialCode: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

function getProductKey(product) {
  return String(product?._id || product?.id || product?.slug || "");
}

function getBrochureUrl(product) {
  if (!product || typeof product !== "object") return "";

  const candidates = [
    product.brochurePdf,
    product.brochureUrl,
    product.brochure,
    product.pdfUrl,
    product.pdf,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate.url || candidate.src || candidate.path;

      if (typeof nested === "string" && nested.trim()) {
        return nested.trim();
      }
    }
  }

  return "";
}

// The enquiry popup shows a short, fixed summary of these product fields.
// Products can save the same information under different specification names,
// so each field lists its equivalent saved names in priority order. Values are
// always read from the selected product record.
const ENQUIRY_SPECIFICATION_FIELDS = [
  { label: "Material", aliases: ["Material"] },
  { label: "Part Type", aliases: ["Part Type", "Product Type"] },
  { label: "Bar Length", aliases: ["Bar Length", "Length", "Size"] },
  { label: "Casting Material", aliases: ["Casting Material", "Material"] },
];

function normalizeSpecificationName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function getSpecificationValue(specifications, fields) {
  if (!Array.isArray(specifications)) return "—";

  const aliases = Array.isArray(fields) ? fields : [fields];

  for (const alias of aliases) {
    const target = normalizeSpecificationName(alias);

    const match = specifications.find(
      (specification) =>
        normalizeSpecificationName(specification?.name) === target,
    );

    const value = String(match?.value || "").trim();

    if (value) return value;
  }

  return "—";
}

export default function ProductEnquiryModal({
  open,
  product,
  products = [],
  mode = "enquiry",
  brochureUrl = "",
  onClose,
}) {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const [country, setCountry] = useState("IN");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  const [activeProduct, setActiveProduct] = useState(product);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpChallengeId, setOtpChallengeId] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [otpRemaining, setOtpRemaining] = useState(0);
  const [resendRemaining, setResendRemaining] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");

  const inputRef = useRef(null);
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const countrySearchRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const countryOpenRef = useRef(countryOpen);

  const selectedCountry =
    COUNTRIES.find((item) => item.code === country) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter((item) => {
    const query = countrySearch.trim().toLowerCase();
    return (
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.dialCode.includes(query.replace(/^\+/, ""))
    );
  });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (mode === "brochure") {
        emailRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }, 60);

    function handleKeyDown(event) {
      if (event.key === "Escape" && countryOpenRef.current) {
        setCountryOpen(false);
        setCountrySearch("");
        return;
      }

      if (event.key === "Escape") onCloseRef.current?.();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, open]);

  useEffect(() => {
    if (!open || mode !== "brochure" || !otpChallengeId || otpVerified) {
      return undefined;
    }

    const updateRemaining = () => {
      setOtpRemaining(
        Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000)),
      );
      setResendRemaining(
        Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)),
      );
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [
    mode,
    open,
    otpChallengeId,
    otpExpiresAt,
    otpVerified,
    resendAvailableAt,
  ]);

  useEffect(() => {
    if (mode === "brochure" && otpChallengeId && !otpVerified) {
      otpRef.current?.focus();
    }
  }, [mode, otpChallengeId, otpVerified]);

  useEffect(() => {
    countryOpenRef.current = countryOpen;
  }, [countryOpen]);

  useEffect(() => {
    if (countryOpen) countrySearchRef.current?.focus();
  }, [countryOpen]);

  if (!open || !product) return null;

  const availableProducts = products.length ? products : [product];

  const activeProductIndex = availableProducts.findIndex(
    (item) => getProductKey(item) === getProductKey(activeProduct),
  );

  const displayedProduct =
    activeProductIndex >= 0
      ? availableProducts[activeProductIndex]
      : activeProduct || product;

  const productName =
    displayedProduct.name || displayedProduct.productName || "";

  const productImage =
    displayedProduct.image ||
    displayedProduct.mainImage ||
    (Array.isArray(displayedProduct.galleryImages)
      ? displayedProduct.galleryImages[0]
      : "") ||
    "";

  const productSpecifications = ENQUIRY_SPECIFICATION_FIELDS.map((field) => ({
    name: field.label,
    value: getSpecificationValue(
      displayedProduct.specifications,
      field.aliases,
    ),
  }));

  const productPrice = formatPriceWithUnit(displayedProduct);
  const moqUnit = getUnit(displayedProduct.moqUnit || "Piece");

  const sellerName =
    displayedProduct.sellerName ||
    displayedProduct.seller ||
    displayedProduct.vendor ||
    "Boiler House Supplies";

  const brochurePdfUrl =
    getBrochureUrl(product) || getBrochureUrl(displayedProduct) || brochureUrl;

  const navigationIndex =
    activeProductIndex >= 0
      ? activeProductIndex
      : availableProducts.findIndex(
          (item) => getProductKey(item) === getProductKey(product),
        );

  const hasProductNavigation =
    mode !== "brochure" && availableProducts.length > 1;

  const canNavigatePrevious = navigationIndex > 0;
  const canNavigateNext =
    navigationIndex >= 0 && navigationIndex < availableProducts.length - 1;

  function navigateProduct(direction) {
    const nextIndex = activeProductIndex + direction;

    if (nextIndex < 0 || nextIndex >= availableProducts.length) return;

    setActiveProduct(availableProducts[nextIndex]);
  }

  function closeModal() {
    setMobile("");
    setError("");
    setStatus("idle");
    setServerError("");
    setCountry("IN");
    setCountryOpen(false);
    setCountrySearch("");
    setActiveProduct(product);

    setEmail("");
    setOtp("");
    setOtpChallengeId("");
    setOtpExpiresAt(0);
    setResendAvailableAt(0);
    setOtpRemaining(0);
    setResendRemaining(0);
    setOtpLoading(false);
    setOtpVerified(false);
    setOtpError("");
    setOtpNotice("");

    onClose?.();
  }

  function validateMobile() {
    const national = mobile.replace(/\D/g, "");

    if (!national) {
      setError("Mobile number is required.");
      return null;
    }

    const parsedPhone = parsePhoneNumberFromString(national, country);

    if (
      !isValidPhoneNumber(national, country) ||
      !parsedPhone?.number ||
      parsedPhone?.getType() === "FIXED_LINE"
    ) {
      setError("Please enter valid phone number");
      return null;
    }

    return parsedPhone.number;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (status === "submitting") return;

    setError("");
    setServerError("");

    const national = validateMobile();
    if (!national) return;

    setStatus("submitting");

    try {
      const productId = displayedProduct._id || displayedProduct.id;

      const response = await api.post("/enquiries", {
        name: "Product Enquiry",
        phone: national,
        ...(typeof productId === "string" && /^[a-f\d]{24}$/i.test(productId)
          ? { product: productId }
          : {}),
        message: `Interested in ${productName}`,
        source: "product-interest",
      });

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            "Unable to send your enquiry. Please try again.",
        );
      }

      setStatus("success");
      setMobile("");
    } catch (requestError) {
      setStatus("error");
      setServerError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to send your enquiry. Please try again.",
      );
    }
  }

  function getOtpErrorMessage(requestError, fallback) {
    return (
      requestError.response?.data?.message || requestError.message || fallback
    );
  }

  async function handleRequestOtp(event) {
    event.preventDefault();

    if (otpLoading) return;

    const enteredEmail = email.trim();
    const normalizedEmail = enteredEmail.toLowerCase();

    if (
      enteredEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail)
    ) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setOtpError("");
    setOtpNotice("");
    setOtpLoading(true);

    try {
      const response = await api.post("/brochure-auth/send-otp", {
        email: enteredEmail,
        productKey: getProductKey(displayedProduct),
      });

      const confirmedEmail =
        typeof response.data?.email === "string"
          ? response.data.email.trim().toLowerCase()
          : "";

      if (
        response.data?.success !== true ||
        response.data?.emailAccepted !== true ||
        typeof response.data?.challengeId !== "string"
      ) {
        throw new Error(
          response.data?.message || "Unable to send the OTP. Please try again.",
        );
      }

      // Never trust a generic success flag: the backend must confirm that the
      // OTP was accepted for exactly the address that was requested.
      if (!confirmedEmail || confirmedEmail !== normalizedEmail) {
        throw new Error(
          "The OTP was not sent to the email address you entered. Please try again.",
        );
      }

      // The OTP form (and its success notice) only appears after the backend
      // confirms that the email was accepted for delivery.
      setEmail(enteredEmail);
      setOtpChallengeId(response.data.challengeId);
      setOtp("");
      setOtpNotice("OTP sent successfully");

      setOtpExpiresAt(
        Date.now() + Number(response.data.expiresInSeconds || 300) * 1000,
      );

      setResendAvailableAt(
        Date.now() + Number(response.data.resendAfterSeconds || 30) * 1000,
      );

      setOtpRemaining(Number(response.data.expiresInSeconds || 300));
    } catch (requestError) {
      // Never keep a challenge (or the OTP form) when delivery failed.
      setOtpChallengeId("");
      setOtpNotice("");
      setOtpError(
        getOtpErrorMessage(
          requestError,
          "Unable to send the OTP. Please try again.",
        ),
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (otpLoading || !otpChallengeId) return;

    setOtpError("");
    setOtpNotice("");
    setOtpLoading(true);

    try {
      const response = await api.post("/brochure-auth/resend-otp", {
        challengeId: otpChallengeId,
      });

      const confirmedEmail =
        typeof response.data?.email === "string"
          ? response.data.email.trim().toLowerCase()
          : "";

      if (
        response.data?.success !== true ||
        response.data?.emailAccepted !== true
      ) {
        throw new Error(
          response.data?.message ||
            "Unable to resend the OTP. Please try again.",
        );
      }

      if (!confirmedEmail || confirmedEmail !== email.trim().toLowerCase()) {
        throw new Error(
          "The OTP was not sent to the email address shown. Please try again.",
        );
      }

      setOtp("");
      setOtpNotice("OTP sent successfully");

      setOtpExpiresAt(
        Date.now() + Number(response.data.expiresInSeconds || 300) * 1000,
      );

      setResendAvailableAt(
        Date.now() + Number(response.data.resendAfterSeconds || 30) * 1000,
      );

      setOtpRemaining(Number(response.data.expiresInSeconds || 300));
    } catch (requestError) {
      // The backend deletes the challenge when the mailbox is known to be
      // invalid or the recipient is rejected. Drop the OTP form and timer.
      const errorCode = requestError.response?.data?.code;
      if (errorCode === "EMAIL_NOT_FOUND" || errorCode === "EMAIL_REJECTED") {
        setOtpChallengeId("");
        setOtpNotice("");
      }

      setOtpError(
        getOtpErrorMessage(
          requestError,
          "Unable to resend the OTP. Please try again.",
        ),
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();

    if (otpLoading || !otpChallengeId) return;

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    if (otpRemaining <= 0) {
      setOtpError("This OTP has expired. Request a new code.");
      return;
    }

    setOtpError("");
    setOtpLoading(true);

    try {
      const response = await api.post("/brochure-auth/verify-otp", {
        challengeId: otpChallengeId,
        productKey: getProductKey(displayedProduct),
        otp,
      });

      if (response.data?.success !== true || response.data?.verified !== true) {
        throw new Error(
          response.data?.message ||
            "OTP verification failed. Please try again.",
        );
      }

      setOtpVerified(true);
      setOtp("");
    } catch (requestError) {
      setOtpError(
        getOtpErrorMessage(
          requestError,
          "OTP verification failed. Please try again.",
        ),
      );
    } finally {
      setOtpLoading(false);
    }
  }

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-enquiry-title"
        className={`relative my-auto w-full ${
          mode === "brochure" ? "max-w-md" : "max-w-4xl"
        } max-h-[calc(100dvh-1.5rem)] overflow-y-auto border border-line bg-paper shadow-2xl`}
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close popup"
          className="sticky top-0 z-10 ml-auto -mb-9 mr-3 flex h-9 w-9 items-center justify-center border border-line bg-white text-ink shadow-sm hover:bg-paper-deep"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        {mode === "brochure" ? (
          <div className="bg-paper p-6 pt-12 sm:p-8">
            <h2
              id="product-enquiry-title"
              className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl"
            >
              {brochurePdfUrl
                ? "Login to connect with suppliers"
                : "Product Brochure"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-steel">
              {brochurePdfUrl
                ? "Login to get verified sellers"
                : "Brochure details for the selected product."}
            </p>

            {!brochurePdfUrl ? (
              <div
                role="status"
                className="mt-6 border border-amber-200 bg-amber-50 p-5"
              >
                <h3 className="text-xl font-semibold text-ink">
                  Brochure not available
                </h3>

                <p className="mt-2 text-sm leading-6 text-steel">
                  A brochure PDF is not available for{" "}
                  <strong className="text-ink">{productName}</strong> right now.
                  Please contact our team for the latest product details.
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-dark mt-5"
                >
                  Close
                </button>
              </div>
            ) : otpVerified ? (
              <div
                role="status"
                className="mt-6 border border-emerald-200 bg-emerald-50 p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckIcon className="h-5 w-5" />
                </span>

                <h3 className="mt-4 text-xl font-semibold text-ink">
                  Email verified
                </h3>

                <p className="mt-2 text-sm leading-6 text-steel">
                  Your email has been verified successfully.
                </p>

                <a
                  href={brochurePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  className="download-brochure-btn"
                >
                  Download Brochure
                </a>
              </div>
            ) : !otpChallengeId ? (
              <form onSubmit={handleRequestOtp} className="mt-6" noValidate>
                <label
                  htmlFor="brochure-login-email"
                  className="block text-sm font-semibold text-ink"
                >
                  Email Address
                </label>

                <input
                  ref={emailRef}
                  id="brochure-login-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setOtpError("");
                  }}
                  aria-invalid={Boolean(otpError)}
                  className="mt-2 w-full border border-line bg-white px-3.5 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  placeholder="Please enter email address"
                />

                {otpError && (
                  <p role="alert" className="mt-2 text-xs text-rose-600">
                    {otpError}
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 text-steel">
                  Your email address is safe with us
                </p>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Sending..." : "GET OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="mt-6" noValidate>
                <p className="text-sm leading-6 text-steel">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-ink">{email}</strong>.
                </p>

                {otpNotice && (
                  <p
                    role="status"
                    className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                  >
                    {otpNotice}
                  </p>
                )}

                <label
                  htmlFor="brochure-email-otp"
                  className="mt-4 block text-sm font-semibold text-ink"
                >
                  Email OTP
                </label>

                <input
                  ref={otpRef}
                  id="brochure-email-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  className="mt-2 w-full border border-line bg-white px-3.5 py-3 text-sm tracking-[0.3em] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                  placeholder="Enter 6-digit OTP"
                />

                <p className="mt-2 text-xs leading-5 text-steel">
                  {otpRemaining > 0
                    ? `OTP expires in ${Math.floor(otpRemaining / 60)}:${String(
                        otpRemaining % 60,
                      ).padStart(2, "0")}`
                    : "OTP expired. Request a new code."}
                </p>

                {otpError && (
                  <p role="alert" className="mt-2 text-xs text-rose-600">
                    {otpError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || otpRemaining <= 0}
                  className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading ? "Verifying..." : "VERIFY OTP"}
                </button>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpLoading || resendRemaining > 0}
                    className="font-semibold text-brand underline underline-offset-2 disabled:text-steel"
                  >
                    {resendRemaining > 0
                      ? `Resend OTP (${resendRemaining}s)`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChallengeId("");
                      setOtp("");
                      setOtpError("");
                      setOtpNotice("");
                    }}
                    className="text-steel underline underline-offset-2"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2">
            <div className="border-b border-line bg-white p-5 md:border-b-0 md:border-r md:p-7">
              <div className="aspect-[4/3] w-full overflow-hidden border border-line bg-paper-deep">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                    <PackageIcon className="h-10 w-10" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                      Product image
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                {productName}
              </h3>
              <p className="mt-2 text-xs text-steel">Sold By - {sellerName}</p>

              {productPrice ? (
                <p className="mt-3 font-display text-xl font-semibold tracking-wide text-ink">
                  {productPrice}
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-ink">
                  Price on request
                </p>
              )}

              <dl className="mt-4 space-y-1.5 border-t border-line pt-3">
                {productSpecifications.map((specification, specIndex) => (
                  <div
                    key={`${specification.name || "specification"}-${specIndex}`}
                    className="flex items-start justify-between gap-3 text-[11px] leading-5"
                  >
                    <dt className="min-w-0 text-steel">
                      {specification.name || "Specification"}
                    </dt>
                    <dd className="min-w-0 text-right font-semibold text-ink">
                      {specification.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              {displayedProduct.moq ? (
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-steel">
                  MOQ: {displayedProduct.moq} {moqUnit}
                </p>
              ) : null}
            </div>

            <div className="bg-paper p-5 sm:p-7">
              <h2
                id="product-enquiry-title"
                className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl"
              >
                Get Best Price and details from {sellerName} on your mobile
                quickly
              </h2>

              {status === "success" ? (
                <div
                  role="status"
                  className="mt-6 border border-emerald-200 bg-emerald-50 p-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <CheckIcon className="h-5 w-5" />
                  </span>

                  <h3 className="mt-4 text-xl font-semibold text-ink">
                    Enquiry sent successfully
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-steel">
                    Thank you! Our team will contact you shortly about{" "}
                    <strong className="text-ink">{productName}</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-dark mt-5"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6" noValidate>
                  <label
                    htmlFor="product-enquiry-mobile"
                    className="block text-sm font-semibold text-ink"
                  >
                    Mobile Number
                  </label>

                  <div className="mt-2 flex">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCountryOpen((current) => !current);
                          setCountrySearch("");
                        }}
                        aria-label={`Select country. Current country ${selectedCountry.name}, +${selectedCountry.dialCode}`}
                        aria-expanded={countryOpen}
                        aria-haspopup="listbox"
                        className="flex h-full items-center gap-2 border border-r-0 border-line bg-white px-3 text-sm font-semibold text-ink hover:bg-paper-deep"
                      >
                        <span
                          aria-hidden="true"
                          className={`fi ${countryFlag(selectedCountry.code)} shrink-0 text-lg`}
                        />
                        <span>+{selectedCountry.dialCode}</span>
                        <span aria-hidden="true" className="text-xs">
                          ▾
                        </span>
                      </button>

                      {countryOpen && (
                        <div className="absolute left-0 top-full z-30 mt-1 w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden border border-line bg-white shadow-xl">
                          <div className="border-b border-line p-2">
                            <input
                              ref={countrySearchRef}
                              type="search"
                              value={countrySearch}
                              onChange={(event) =>
                                setCountrySearch(event.target.value)
                              }
                              placeholder="Search country or code"
                              aria-label="Search countries"
                              className="w-full border border-line bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                            />
                          </div>

                          <ul
                            role="listbox"
                            aria-label="Countries"
                            className="max-h-56 overflow-y-auto py-1"
                          >
                            {filteredCountries.map((item) => (
                              <li key={item.code}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={item.code === country}
                                  onClick={() => {
                                    setCountry(item.code);
                                    setMobile("");
                                    setError("");
                                    setServerError("");
                                    setStatus("idle");
                                    setCountryOpen(false);
                                    setCountrySearch("");
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-deep"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`fi ${countryFlag(item.code)} shrink-0 text-lg`}
                                  />
                                  <span className="min-w-0 flex-1 truncate">
                                    {item.name}
                                  </span>
                                  <span className="text-steel">
                                    +{item.dialCode}
                                  </span>
                                </button>
                              </li>
                            ))}

                            {filteredCountries.length === 0 && (
                              <li className="px-3 py-3 text-sm text-steel">
                                No countries found.
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <input
                      ref={inputRef}
                      id="product-enquiry-mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={17}
                      required
                      placeholder="Please enter mobile number"
                      value={mobile}
                      onChange={(event) => {
                        setMobile(
                          event.target.value.replace(/\D/g, "").slice(0, 15),
                        );
                        setError("");
                        setServerError("");
                        if (status === "error") setStatus("idle");
                      }}
                      aria-invalid={Boolean(error)}
                      className={`min-w-0 flex-1 border bg-white px-3.5 py-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-4 ${
                        error
                          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                          : "border-line focus:border-brand focus:ring-brand/10"
                      }`}
                    />
                  </div>

                  {error && (
                    <p role="alert" className="mt-2 text-xs text-rose-600">
                      {error}
                    </p>
                  )}

                  <p className="mt-2 text-xs leading-5 text-steel">
                    We will contact you on this number
                  </p>

                  {serverError && (
                    <p
                      role="alert"
                      className="mt-3 border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
                    >
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? "Submitting..." : "Submit Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {hasProductNavigation && (
          <>
            <button
              type="button"
              onClick={() => navigateProduct(-1)}
              disabled={!canNavigatePrevious}
              aria-label="Previous product"
              className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-lg disabled:opacity-40 sm:-left-14 sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigateProduct(1)}
              disabled={!canNavigateNext}
              aria-label="Next product"
              className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink shadow-lg disabled:opacity-40 sm:-right-14 sm:h-11 sm:w-11"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
