import { useState } from "react";
import ProductEnquiryModal from "./ProductEnquiryModal.jsx";
import RichText from "./RichText.jsx";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnail,
  getYouTubeVideoId,
  getYouTubeWatchUrl,
} from "../lib/youtube.js";
import { FileCheckIcon, MailIcon, PackageIcon, PhoneIcon } from "./Icons.jsx";

// Exact product content from
// https://www.boilerhouse.in/grate-bar.html#pulsating-grate-bar
const REFERENCE = {
  name: "Pulsating Grate Bar",
  price: "₹ 160",
  unit: "Kg",
  moq: "100 Kg",

  video: "https://www.youtube.com/watch?v=9Dfc32LhmNI",
  gallery: [
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/Default/2023/10/354554631/JW/EL/EF/199681243/pulsating-grate-bar-2-500x500.jpg",
      thumb:
        "https://5.imimg.com/data5/SELLER/Default/2023/10/354554631/JW/EL/EF/199681243/pulsating-grate-bar-2-125x125.jpg",
    },
    {
      type: "video",
      full: "https://img.youtube.com/vi/9Dfc32LhmNI/sddefault.jpg",
      thumb: "https://i.ytimg.com/vi/9Dfc32LhmNI/default.jpg",
      href: "https://www.youtube.com/watch?v=9Dfc32LhmNI",
    },
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/Default/2023/10/354554633/WD/OR/CN/199681243/pulsating-grate-bar-1000x1000.jpg",
      thumb:
        "https://5.imimg.com/data5/SELLER/Default/2023/10/354554633/WD/OR/CN/199681243/pulsating-grate-bar-125x125.jpg",
    },
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/PDFImage/2025/6/517726845/FH/XW/XU/199681243/pulsating-grate-bar-1000x1000.png",
      thumb:
        "https://5.imimg.com/data5/SELLER/PDFImage/2025/6/517726845/FH/XW/XU/199681243/pulsating-grate-bar-125x125.png",
    },
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/Default/2025/6/517883858/AP/IX/OI/199681243/pulsating-grate-bar-1000x1000.jpg",
      thumb:
        "https://5.imimg.com/data5/SELLER/Default/2025/6/517883858/AP/IX/OI/199681243/pulsating-grate-bar-125x125.jpg",
    },
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/Default/2025/6/517884124/IB/LC/AE/199681243/pulsating-grate-bar-1000x1000.jpg",
      thumb:
        "https://5.imimg.com/data5/SELLER/Default/2025/6/517884124/IB/LC/AE/199681243/pulsating-grate-bar-125x125.jpg",
    },
    {
      type: "image",
      full: "https://5.imimg.com/data5/SELLER/Default/2025/6/517884448/QL/SI/QP/199681243/pulsating-grate-bar-1000x1000.jpg",
      thumb:
        "https://5.imimg.com/data5/SELLER/Default/2025/6/517884448/QL/SI/QP/199681243/pulsating-grate-bar-125x125.jpg",
    },
  ],
  specs: [
    ["Material", "Alloy Steel"],
    ["Part Type", "Grate Bar"],
    ["Bar Length", "600 mm"],
    ["Casting Material", "Alloy Steel"],
    ["Bar Thickness", "70 mm"],
    ["Temperature Rating", "Above 1000 C"],
    ["Grate Type", "Reciprocating"],
    [
      "Operating Boiler Type",
      "Hot Water Boiler, Steam Boiler, Industrial Furnace, Biomass Boiler, Waste Heat Boiler, Power Boiler, Thermic Fluid Heater, Solid Fuel Boiler",
    ],
    ["Boiler Type", "Steam Boiler, CFB Boiler, AFBC Boiler, Thermic Boiler"],
    ["Product Type", "Grate Bar"],
    ["Color", "Gray"],
    ["Usage/Application", "Industrial"],
    ["Surface Treatment", "As Cast"],
    ["Standard", "ASTM, DIN"],
    ["Packaging Type", "Box"],
    ["Warranty", "2 Year"],
    ["Country of Origin", "Made in India"],
  ],
};

function isReferenceProduct(product) {
  const slug = String(product?.slug || "").toLowerCase();
  const name = String(product?.name || "").toLowerCase();

  return slug === "pulsating-grate-bar" || name === "pulsating grate bar";
}

function toUnit(value) {
  return String(value || "").trim();
}

function toYoutubeGalleryItems(videos) {
  if (!Array.isArray(videos)) return [];

  const seen = new Set();

  return videos
    .map((video) => {
      const url =
        typeof video === "string"
          ? video
          : video && typeof video === "object"
            ? video.url || video.href || video.videoUrl
            : "";
      const videoId = getYouTubeVideoId(url);

      if (!videoId || seen.has(videoId)) return null;

      seen.add(videoId);

      return {
        type: "video",
        videoId,
        full: getYouTubeThumbnail(videoId, "hqdefault"),
        thumb: getYouTubeThumbnail(videoId, "mqdefault"),
        href: getYouTubeWatchUrl(videoId),
      };
    })
    .filter(Boolean);
}

function getProductContent(product) {
  const reference = isReferenceProduct(product);
  const productVideos = toYoutubeGalleryItems(product?.youtubeVideos);

  if (reference) {
    const referenceVideoIds = new Set(
      REFERENCE.gallery
        .filter((item) => item.type === "video")
        .map((item) => getYouTubeVideoId(item.href))
        .filter(Boolean),
    );
    const extraVideos = productVideos.filter(
      (video) => !referenceVideoIds.has(video.videoId),
    );

    return {
      name: REFERENCE.name,
      price: REFERENCE.price,
      unit: REFERENCE.unit,
      moq: REFERENCE.moq,
      brochure: product?.brochurePdf || "",
      gallery: [...REFERENCE.gallery, ...extraVideos],
      specs: REFERENCE.specs,
      description: (
        <>
          A <strong>Stainless Steel Grate Bar</strong> is a crucial component in
          the construction of <strong>grate systems</strong> used in{" "}
          <strong>furnaces</strong> or <strong>boilers</strong> (such as{" "}
          <strong>stainless steel travelling grate boilers</strong>).
        </>
      ),
    };
  }

  const fallbackImages = [
    product?.image,
    ...(product?.galleryImages || []),
  ].filter(Boolean);

  const fallbackGallery = [...new Set(fallbackImages)].map((image) => ({
    type: "image",
    full: image,
    thumb: image,
  }));

  const fallbackSpecs = (product?.specifications || []).map((specification) => [
    specification.name || "Specification",
    specification.value || "—",
  ]);

  const hasMoqRow = fallbackSpecs.some(([name]) =>
    /minimum order quantity/i.test(name),
  );

  const moqValue = product?.moq
    ? `${Number(product.moq).toLocaleString("en-IN")} ${toUnit(
        product.moqUnit || "Kg",
      )}`
    : "On request";

  return {
    name: product?.name || "",
    price:
      product?.price !== undefined && product?.price !== null
        ? `₹${Number(product.price).toLocaleString("en-IN")}`
        : "",
    unit: toUnit(product?.priceUnit || "Piece"),
    moq: moqValue,
    brochure: product?.brochurePdf || "",
    gallery: [...fallbackGallery, ...productVideos],
    specs: hasMoqRow
      ? fallbackSpecs
      : [...fallbackSpecs, ["Minimum order quantity", moqValue]],
    description:
      product?.description ||
      "Contact our team for specifications, availability and pricing.",
  };
}

function ProductTitle({ content, headingLevel, onRequestCallback }) {
  const HeadingTag = headingLevel === "h1" ? "h1" : "h2";

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
        <HeadingTag className="w-full bg-[#f8f8f8] px-[10px] py-[10px] text-[21px] font-bold leading-snug text-[#0f0f10]">
          {content.name}
        </HeadingTag>

        <button
          type="button"
          onClick={onRequestCallback}
          className="flex h-[34px] w-[165px] shrink-0 items-center justify-center gap-1.5 self-end rounded-full border border-[#c2450f] bg-white text-[14px] font-semibold text-[#c2450f] transition-colors hover:bg-[#c2450f] hover:text-white sm:self-auto"
        >
          <PhoneIcon className="h-[15px] w-[15px]" />
          Request Callback
        </button>
      </div>
    </div>
  );
}

export function ProductShowcaseHeader({
  product,
  products = [],
  headingLevel = "h1",
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const content = getProductContent(product);

  return (
    <>
      <ProductTitle
        content={content}
        headingLevel={headingLevel}
        onRequestCallback={() => setEnquiryOpen(true)}
      />
      <ProductEnquiryModal
        open={enquiryOpen}
        product={product}
        products={products}
        onClose={() => setEnquiryOpen(false)}
      />
    </>
  );
}

export default function ProductShowcase({
  product,
  products = [],
  headingLevel = "h2",
  showHeader = true,
  stickyMedia = false,
}) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [modalMode, setModalMode] = useState("enquiry");
  const [activeIndex, setActiveIndex] = useState(0);

  const content = getProductContent(product);

  function openEnquiry() {
    setModalMode("enquiry");
    setEnquiryOpen(true);
  }

  function openBrochureLogin() {
    setModalMode("brochure");
    setEnquiryOpen(true);
  }

  const activeItem = content.gallery[activeIndex] || content.gallery[0];
  const activeVideoId =
    activeItem?.type === "video"
      ? activeItem.videoId ||
        getYouTubeVideoId(activeItem.href || activeItem.full)
      : "";

  return (
    <>
      <article
        id={`product-${product?.slug || "details"}`}
        className="mb-[30px] scroll-mt-24 lg:scroll-mt-28"
      >
        {showHeader ? (
          <ProductTitle
            content={content}
            headingLevel={headingLevel}
            onRequestCallback={openEnquiry}
          />
        ) : null}

        <div
          className={`${showHeader ? "mt-[15px]" : ""} grid gap-[30px] lg:grid-cols-2 lg:gap-[30px]`}
        >
          {/* Sticky media is bounded by this product's specifications row. */}
          <div
            className={`product-media min-w-0${stickyMedia ? " product-media--sticky" : ""}`}
          >
              <div className="relative mx-auto aspect-square w-full max-w-[488px] overflow-hidden rounded-[6px] border border-[#ececec] bg-white">
                {activeItem ? (
                  activeItem.type === "video" && activeVideoId ? (
                    <iframe
                      key={activeVideoId}
                      src={getYouTubeEmbedUrl(activeVideoId, { autoplay: true })}
                      title={`${content.name} product video`}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : activeItem.type === "video" ? (
                    <a
                      href={activeItem.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block h-full w-full"
                      aria-label="Play product video"
                    >
                      <img
                        src={activeItem.full}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
                        <span className="flex h-[60px] w-[80px] items-center justify-center rounded-[16px] bg-[#c2450f]">
                          <span className="ml-[5px] h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-white" />
                        </span>
                      </span>
                    </a>
                  ) : (
                    <img
                      src={activeItem.full}
                      alt={content.name}
                      className="h-full w-full object-contain p-1"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
                    <PackageIcon className="h-14 w-14" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      Product image
                    </span>
                  </div>
                )}

                {activeItem?.type !== "video" ? (
                  <button
                    type="button"
                    onClick={openEnquiry}
                    className="absolute bottom-5 left-1/2 h-[31px] w-[200px] max-w-[calc(100%-2rem)] -translate-x-1/2 whitespace-nowrap rounded-full border border-[#c2450f] bg-white px-4 text-[14px] font-semibold text-[#c2450f] transition-colors hover:bg-[#c2450f] hover:text-white"
                  >
                    Get Best Quote
                  </button>
                ) : null}
            </div>

              {content.gallery.length > 1 ? (
                <div className="mt-[15px] flex gap-3 overflow-x-auto pb-1 sm:gap-[31px]">
                  {content.gallery.map((item, index) => {
                    const active = index === activeIndex;

                    return (
                      <button
                        key={`${item.thumb}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        aria-label={`View ${item.type === "video" ? "video" : "image"} ${index + 1} of ${content.name}`}
                        aria-pressed={active}
                        className={`relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[10px] border transition-colors sm:h-[80px] sm:w-[80px] ${
                          active
                            ? "border-[#c2450f] p-[5px]"
                            : "border-[#bdbdbd] p-0 hover:border-[#c2450f]"
                        }`}
                      >
                        <img
                          src={item.thumb}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        {item.type === "video" ? (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="flex h-4 w-5 items-center justify-center rounded-[3px] bg-[#c2450f]">
                              <span className="ml-[2px] h-0 w-0 border-y-[4px] border-l-[6px] border-y-transparent border-l-white" />
                            </span>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-[5px] gap-y-1">
              <p className="text-[22px] font-normal leading-none text-[#0f0f10] sm:text-[24px]">
                {content.price || "On request"}
                {content.price ? (
                  <span className="ml-[2px] text-[12px] font-semibold">
                    {" "}
                    / {content.unit}
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={openEnquiry}
                className="text-[16px] font-medium text-[#c2450f] underline hover:no-underline sm:text-[18px]"
              >
                Get Latest Price
              </button>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={openBrochureLogin}
                className="inline-flex items-center gap-1.5 text-[14px] text-[#333333] transition-colors hover:text-[#c2450f] hover:underline"
              >
                <FileCheckIcon className="h-[22px] w-[22px] text-[#c2450f]" />
                Product Brochure
              </button>
            </div>

            <div className="mt-[10px]">
              {content.specs.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    {content.name} specifications
                  </caption>
                  <tbody>
                    {content.specs.map(([name, value], index) => (
                      <tr key={`${name}-${index}`}>
                        <td className="w-[20%] py-1 pr-2 align-top text-[13px] font-semibold leading-[1.5] text-[#333333] sm:text-[14px]">
                          {name}
                        </td>
                        <td className="w-[70%] py-1 pl-4 align-top text-[13px] leading-[1.5] text-[#333333] sm:pl-[50px] sm:text-[14px]">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[14px] leading-6 text-[#333333]">
                  Detailed specifications are available on request.
                </p>
              )}

              <p className="mt-1.5 text-[13px] text-[#333333] sm:text-[14px]">
                <span className="font-semibold">Minimum order quantity: </span>
                <span>{content.moq}</span>
              </p>

              {content.description ? (
                <div className="mt-4 border-t border-[#ececec] pt-3">
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#0f0f10] sm:text-[14px]">
                    Product Description
                  </h3>
                  <RichText
                    value={content.description}
                    className="mt-1.5 text-[13px] leading-6 text-[#333333] sm:text-[14px]"
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={openEnquiry}
              className="mt-[15px] flex w-full items-center justify-center gap-[10px] rounded-[10px] border border-[#c2450f] bg-[#c2450f] px-4 py-[9px] text-[16px] font-semibold text-white transition-colors hover:bg-white hover:text-[#c2450f] lg:w-[58%]"
            >
              <MailIcon className="h-[22px] w-[22px]" />
              Yes! I am interested
            </button>
          </div>
        </div>
      </article>

      <ProductEnquiryModal
        open={enquiryOpen}
        product={product}
        products={products}
        mode={modalMode}
        brochureUrl={content.brochure}
        onClose={() => setEnquiryOpen(false)}
      />
    </>
  );
}

export function ProductShowcaseSkeleton({ showHeader = true }) {
  return (
    <div className="mb-[30px]">
      {showHeader ? (
        <>
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
            <div className="h-[41px] w-full animate-pulse bg-[#f8f8f8]" />
            <div className="h-[34px] w-[165px] animate-pulse bg-[#f0f0f0]" />
          </div>
          <div className="mt-2 h-6 w-full animate-pulse bg-[#f0f0f0]" />
        </>
      ) : null}
      <div
        className={`${showHeader ? "mt-[15px]" : ""} grid gap-[30px] lg:grid-cols-2`}
      >
        <div>
          <div className="mx-auto aspect-square w-full max-w-[488px] animate-pulse bg-[#f0f0f0]" />
          <div className="mt-[15px] flex gap-3 sm:gap-[31px]">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-[64px] w-[64px] animate-pulse bg-[#f0f0f0] sm:h-[80px] sm:w-[80px]"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 h-[28px] w-[190px] animate-pulse bg-[#f0f0f0]" />
          <div className="mb-2 h-[24px] w-[120px] animate-pulse bg-[#f0f0f0]" />
          <div className="mb-3 h-[360px] w-full animate-pulse bg-[#f0f0f0]" />
          <div className="mb-3 h-[50px] w-full animate-pulse bg-[#f0f0f0]" />
          <div className="h-[44px] w-full animate-pulse bg-[#f0f0f0]" />
        </div>
      </div>
    </div>
  );
}
