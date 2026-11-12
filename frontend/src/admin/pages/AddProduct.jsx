import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PackageIcon,
  StarIcon,
} from "../../components/Icons.jsx";
import api from "../../api.js";
import { getPlainText } from "../../lib/richText.js";
import { getYouTubeVideoId } from "../../lib/youtube.js";
import RichTextEditor from "../components/RichTextEditor.jsx";
import SearchableCategorySelect from "../components/SearchableCategorySelect.jsx";
import EnquiriesBadge from "../components/EnquiriesBadge.jsx";
import { clearAdminToken, getAdminToken } from "../auth.js";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function GridIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TagIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M3.5 11.6V4.5a1 1 0 0 1 1-1h7.1a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function LogoutIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M9.5 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3.5" />
      <path d="M14 8.5 17.5 12 14 15.5" />
      <path d="M8 12h9.5" />
    </svg>
  );
}

function UploadIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M12 16V4.5" />
      <path d="m7.5 9 4.5-4.5L16.5 9" />
      <path d="M4.5 15.5v2A1.5 1.5 0 0 0 6 19h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  );
}

function FileIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <path d="M14.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    </svg>
  );
}

const navigation = [
  { label: "Dashboard", to: "/admin/dashboard", icon: GridIcon },
  { label: "Enquiries", to: "/admin/enquiries", icon: MailIcon },
  { label: "Categories", to: "/admin/categories", icon: TagIcon },
  {
    label: "Manage Products",
    to: "/admin/manage-products",
    icon: PackageIcon,
  },
  { label: "Add Product", to: "/admin/add-product", icon: PlusIcon },
  { label: "Testimonials", to: "/admin/testimonials", icon: StarIcon },
];

const emptyValues = {
  name: "",
  category: "",
  price: "",
  priceUnit: "Piece",
  moq: "",
  moqUnit: "Piece",
  description: "",
};

function inputValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

const UNIT_OPTIONS = ["Piece", "Kg", "Set", "Meter", "Litre", "Ton", "Unit"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_BROCHURE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function brochureFileName(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const pathWithoutQuery = value.trim().split(/[?#]/)[0];
  const name = pathWithoutQuery.split("/").pop() || "";

  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

function apiOrigin() {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return "";
  }
}

// Existing uploads are stored as `/uploads/...`; the preview needs an absolute
// URL while the API should keep receiving the original relative path.
function resolveImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const url = value.trim();
  const origin = apiOrigin();

  if (url.startsWith("/uploads/") && origin) {
    return `${origin}${url}`;
  }

  return url;
}

function storedImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const url = value.trim();
  const origin = apiOrigin();

  if (origin && url.startsWith(origin)) {
    return url.slice(origin.length);
  }

  return url;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const isEditing = Boolean(productId);
  const imageInputRef = useRef(null);
  const brochureInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());
  const nextImageIdRef = useRef(1);
  const nextSpecIdRef = useRef(1);
  const nextYoutubeIdRef = useRef(1);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [brochure, setBrochure] = useState(null);
  const [storedBrochure, setStoredBrochure] = useState("");
  const [brochureRemoved, setBrochureRemoved] = useState(false);
  const [specifications, setSpecifications] = useState([
    { id: 0, name: "", value: "" },
  ]);
  const [youtubeVideos, setYoutubeVideos] = useState([{ id: 0, url: "" }]);
  const [status, setStatus] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [productLoadError, setProductLoadError] = useState("");

  const loadCategories = useCallback(
    async (signal) => {
      try {
        const response = await api.get("/categories", { signal });

        setCategories(response.data.categories || []);
        setCategoriesError("");
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED" || signal?.aborted) {
          return;
        }

        if (requestError.response?.status === 401) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        setCategoriesError(
          requestError.response?.data?.message ||
            "Unable to load categories. Make sure the backend is running and try again.",
        );
      } finally {
        if (!signal?.aborted) setCategoriesLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const controller = new AbortController();

    // State updates happen after the request resolves, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories(controller.signal);

    return () => controller.abort();
  }, [loadCategories]);

  function handleRetryCategories() {
    setCategoriesLoading(true);
    setCategoriesError("");
    loadCategories();
  }

  // Prefill the same form when the route includes a product id so the admin
  // can edit existing MongoDB products without a separate page.
  useEffect(() => {
    if (!productId) return undefined;

    const controller = new AbortController();

    api
      .get(`/products/${productId}`, { signal: controller.signal })
      .then((response) => {
        const product = response.data.product;

        if (!product) {
          throw new Error("Product not found.");
        }

        const rawCategory = product.category;
        const categoryId =
          rawCategory && typeof rawCategory === "object"
            ? rawCategory._id
            : rawCategory;

        setValues({
          name: product.productName || product.name || "",
          category: categoryId ? String(categoryId) : "",
          // MongoDB returns these as numbers; controlled inputs and the submit
          // handler expect strings.
          price: inputValue(product.price),
          priceUnit: product.priceUnit || "Piece",
          moq: inputValue(product.moq),
          moqUnit: product.moqUnit || "Piece",
          description: product.description || "",
        });

        const gallery = Array.isArray(product.galleryImages)
          ? product.galleryImages
          : [];
        const productImages = [product.mainImage, ...gallery].filter(Boolean);

        setImages(
          productImages.map((stored) => ({
            id: nextImageIdRef.current++,
            file: null,
            stored,
            url: resolveImageUrl(stored),
          })),
        );

        const storedBrochurePath = product.brochurePdf || product.brochure || "";

        setBrochure(null);
        setStoredBrochure(
          typeof storedBrochurePath === "string" && storedBrochurePath.trim()
            ? storedImageUrl(storedBrochurePath)
            : "",
        );
        setBrochureRemoved(false);

        if (brochureInputRef.current) brochureInputRef.current.value = "";

        const productSpecifications = Array.isArray(product.specifications)
          ? product.specifications
          : [];

        setSpecifications(
          productSpecifications.length
            ? productSpecifications.map((specification) => ({
                id: nextSpecIdRef.current++,
                name: specification.name || "",
                value: specification.value || "",
              }))
            : [{ id: nextSpecIdRef.current++, name: "", value: "" }],
        );

        const productVideos = Array.isArray(product.youtubeVideos)
          ? product.youtubeVideos
          : [];

        setYoutubeVideos(
          productVideos.length
            ? productVideos.map((video) => ({
                id: nextYoutubeIdRef.current++,
                url:
                  typeof video === "string"
                    ? video
                    : video?.url || video?.href || video?.videoUrl || "",
              }))
            : [{ id: nextYoutubeIdRef.current++, url: "" }],
        );
      })
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED" || controller.signal.aborted) {
          return;
        }

        if (requestError.response?.status === 401) {
          clearAdminToken();
          navigate("/admin/login", { replace: true });
          return;
        }

        setProductLoadError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load this product. Please try again.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProduct(false);
      });

    return () => controller.abort();
  }, [productId, navigate]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setSidebarOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleLogout() {
    clearAdminToken();
    closeSidebar();
    navigate("/", { replace: true });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setStatus("");
    setSubmitError("");

    setErrors((current) => {
      if (!current[name]) return current;
      return { ...current, [name]: "" };
    });
  }

  function handleDescriptionChange(value) {
    setValues((current) => ({ ...current, description: value }));
    setStatus("");
    setSubmitError("");

    setErrors((current) => {
      if (!current.description) return current;
      return { ...current, description: "" };
    });
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    const accepted = [];
    const messages = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        messages.push(`${file.name} is not a supported image file.`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        messages.push(`${file.name} is larger than 5 MB.`);
        return;
      }

      accepted.push(file);
    });

    if (accepted.length) {
      const nextImages = accepted.map((file) => {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);

        return { id: nextImageIdRef.current++, file, url };
      });

      setImages((current) => [...current, ...nextImages]);
      setStatus("");
      setSubmitError("");
    }

    setErrors((current) => ({ ...current, images: messages.join(" ") }));
  }

  function removeImage(id) {
    const target = images.find((image) => image.id === id);

    if (target) {
      URL.revokeObjectURL(target.url);
      objectUrlsRef.current.delete(target.url);
    }

    setImages((current) => current.filter((image) => image.id !== id));
  }

  function handleBrochureChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors((current) => ({
        ...current,
        brochure: "Choose a PDF file for the brochure.",
      }));
      return;
    }

    if (file.size > MAX_BROCHURE_SIZE) {
      setErrors((current) => ({
        ...current,
        brochure: "Brochure PDF must be 10 MB or smaller.",
      }));
      return;
    }

    setBrochure(file);
    setBrochureRemoved(false);
    setErrors((current) => ({ ...current, brochure: "" }));
    setStatus("");
    setSubmitError("");
  }

  function removeBrochure() {
    setBrochure(null);
    setStoredBrochure("");
    setBrochureRemoved(true);
    setErrors((current) => ({ ...current, brochure: "" }));
    setStatus("");
    setSubmitError("");

    if (brochureInputRef.current) brochureInputRef.current.value = "";
  }

  function addYoutubeVideo() {
    setYoutubeVideos((current) => [
      ...current,
      { id: nextYoutubeIdRef.current++, url: "" },
    ]);
    setStatus("");
    setSubmitError("");
  }

  function removeYoutubeVideo(id) {
    setYoutubeVideos((current) =>
      current.filter((video) => video.id !== id),
    );

    setErrors((current) => {
      if (!current.youtubeVideos?.[id]) return current;

      const nextYoutubeErrors = { ...current.youtubeVideos };
      delete nextYoutubeErrors[id];

      return { ...current, youtubeVideos: nextYoutubeErrors };
    });
  }

  function handleYoutubeVideoChange(id, value) {
    setYoutubeVideos((current) =>
      current.map((video) =>
        video.id === id ? { ...video, url: value } : video,
      ),
    );
    setStatus("");
    setSubmitError("");

    setErrors((current) => {
      if (!current.youtubeVideos?.[id]) return current;

      const nextYoutubeErrors = { ...current.youtubeVideos };
      delete nextYoutubeErrors[id];

      return { ...current, youtubeVideos: nextYoutubeErrors };
    });
  }

  function addSpecification() {
    setSpecifications((current) => [
      ...current,
      { id: nextSpecIdRef.current++, name: "", value: "" },
    ]);
  }

  function removeSpecification(id) {
    setSpecifications((current) =>
      current.filter((specification) => specification.id !== id),
    );

    setErrors((current) => {
      if (!current.specifications?.[id]) return current;

      const nextSpecificationErrors = { ...current.specifications };
      delete nextSpecificationErrors[id];

      return { ...current, specifications: nextSpecificationErrors };
    });
  }

  function handleSpecificationChange(id, field, value) {
    setSpecifications((current) =>
      current.map((specification) =>
        specification.id === id
          ? { ...specification, [field]: value }
          : specification,
      ),
    );
    setStatus("");
    setSubmitError("");

    setErrors((current) => {
      const row = current.specifications?.[id];

      if (!row?.[field]) return current;

      return {
        ...current,
        specifications: {
          ...current.specifications,
          [id]: { ...row, [field]: "" },
        },
      };
    });
  }

  function buildProductFormData() {
    const formData = new FormData();
    const price = inputValue(values.price).trim();
    const moq = inputValue(values.moq).trim();

    formData.append("productName", values.name.trim());
    formData.append("category", values.category);
    formData.append("description", values.description.trim());

    if (price) {
      formData.append("price", price);
    }

    formData.append("priceUnit", values.priceUnit);

    if (moq) {
      formData.append("moq", moq);
    }

    formData.append("moqUnit", values.moqUnit);

    const productSpecifications = specifications
      .filter(
        (specification) =>
          specification.name.trim() || specification.value.trim(),
      )
      .map((specification) => ({
        name: specification.name.trim(),
        value: specification.value.trim(),
      }));

    if (productSpecifications.length) {
      formData.append(
        "specifications",
        JSON.stringify(productSpecifications),
      );
    }

    const [mainImage, ...galleryImages] = images;

    if (mainImage?.file) {
      formData.append("mainImage", mainImage.file);
    } else if (isEditing && mainImage?.stored) {
      formData.append("mainImage", storedImageUrl(mainImage.stored));
    }

    // Existing gallery images are sent back as URLs so removing a newly added
    // image does not drop the uploads that are already stored in MongoDB.
    const existingGallery = [];

    galleryImages.forEach((image) => {
      if (image.file) {
        formData.append("galleryImages", image.file);
      } else if (image.stored) {
        existingGallery.push(storedImageUrl(image.stored));
      }
    });

    if (existingGallery.length) {
      formData.append("galleryImages", JSON.stringify(existingGallery));
    }

    // Always send the array so removing every video also clears it in MongoDB.
    const youtubeUrls = youtubeVideos
      .map((video) => video.url.trim())
      .filter(Boolean);

    formData.append("youtubeVideos", JSON.stringify(youtubeUrls));

    if (brochure) {
      formData.append("brochurePdf", brochure);
    } else if (isEditing) {
      if (storedBrochure) {
        formData.append("brochurePdf", storedImageUrl(storedBrochure));
      } else if (brochureRemoved) {
        // An empty value clears the brochure in MongoDB without touching any
        // other product field.
        formData.append("brochurePdf", "");
      }
    }

    return formData;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    const next = {};

    if (!values.name.trim()) {
      next.name = "Enter the product name.";
    }

    if (!values.category) {
      next.category = "Select a category.";
    }

    if (!getPlainText(values.description)) {
      next.description = "Enter a description.";
    }

    const price = inputValue(values.price).trim();
    const moq = inputValue(values.moq).trim();

    if (price) {
      const numericPrice = Number(price);

      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        next.price = "Enter a valid price.";
      }
    }

    if (!moq) {
      next.moq = "Enter the minimum order quantity.";
    } else {
      const numericMoq = Number(moq);

      if (!Number.isInteger(numericMoq) || numericMoq < 1) {
        next.moq = "Enter a whole number of 1 or more.";
      }
    }

    if (!images.length) {
      next.images = "Upload at least one product image.";
    }

    const specificationErrors = {};

    specifications.forEach((specification) => {
      const name = specification.name.trim();
      const value = specification.value.trim();

      if (!name && !value) return;

      const row = {};

      if (!name) {
        row.name = "Enter a specification name.";
      }

      if (!value) {
        row.value = "Enter a specification value.";
      }

      if (Object.keys(row).length) {
        specificationErrors[specification.id] = row;
      }
    });

    if (Object.keys(specificationErrors).length) {
      next.specifications = specificationErrors;
    }

    const youtubeErrors = {};

    youtubeVideos.forEach((video) => {
      const url = video.url.trim();

      if (!url) return;

      if (!getYouTubeVideoId(url)) {
        youtubeErrors[video.id] = "Enter a valid YouTube video URL.";
      }
    });

    if (Object.keys(youtubeErrors).length) {
      next.youtubeVideos = youtubeErrors;
    }

    setErrors(next);
    setSubmitError("");

    const fieldOrder = ["name", "category", "description", "price", "moq"];

    for (const field of fieldOrder) {
      if (next[field]) {
        document.getElementById(`product-${field}`)?.focus();
        setStatus("");
        return;
      }
    }

    if (next.images) {
      imageInputRef.current?.focus();
      setStatus("");
      return;
    }

    if (next.specifications) {
      const firstId = Object.keys(next.specifications)[0];
      document.getElementById(`specification-name-${firstId}`)?.focus();
      setStatus("");
      return;
    }

    if (next.youtubeVideos) {
      const firstId = Object.keys(next.youtubeVideos)[0];
      document.getElementById(`youtube-video-${firstId}`)?.focus();
      setStatus("");
      return;
    }

    const token = getAdminToken();

    if (!token) {
      clearAdminToken();
      navigate("/admin/login", { replace: true });
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const formData = buildProductFormData();
      const requestConfig = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = isEditing
        ? await api.put(`/products/${productId}`, formData, requestConfig)
        : await api.post("/products", formData, requestConfig);

      const savedName =
        response.data.product?.productName || values.name.trim();

      if (isEditing) {
        const savedBrochure = response.data.product?.brochurePdf || "";

        setBrochure(null);
        setStoredBrochure(
          savedBrochure ? storedImageUrl(savedBrochure) : "",
        );
        setBrochureRemoved(false);

        if (brochureInputRef.current) brochureInputRef.current.value = "";

        setStatus(`"${savedName}" was updated successfully.`);
      } else {
        setStatus(`"${savedName}" was added successfully.`);
        setValues(emptyValues);
        setErrors({});
        setImages([]);
        setBrochure(null);
        setStoredBrochure("");
        setBrochureRemoved(false);
        setSpecifications([{ id: 0, name: "", value: "" }]);
        setYoutubeVideos([{ id: nextYoutubeIdRef.current++, url: "" }]);
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current.clear();

        if (imageInputRef.current) imageInputRef.current.value = "";
        if (brochureInputRef.current) brochureInputRef.current.value = "";
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        clearAdminToken();
        navigate("/admin/login", { replace: true });
        return;
      }

      setSubmitError(
        requestError.response?.data?.message ||
          "Unable to save the product. Make sure the backend is running and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    objectUrlsRef.current.clear();

    setValues(emptyValues);
    setErrors({});
    setImages([]);
    setBrochure(null);
    setStoredBrochure("");
    setBrochureRemoved(false);
    setSpecifications([{ id: 0, name: "", value: "" }]);
    setYoutubeVideos([{ id: nextYoutubeIdRef.current++, url: "" }]);
    setStatus("");
    setSubmitError("");

    if (imageInputRef.current) imageInputRef.current.value = "";
    if (brochureInputRef.current) brochureInputRef.current.value = "";

    navigate(isEditing ? "/admin/manage-products" : "/admin/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 font-sans text-slate-600 selection:bg-slate-900 selection:text-white [&_a:focus-visible]:outline-slate-900 [&_button:focus-visible]:outline-slate-900">
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-blue-200/30 blur-3xl"
        aria-hidden="true"
      />

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div className="relative flex min-h-screen">
        <aside
          id="admin-sidebar"
          aria-label="Admin navigation"
          className={`fixed top-0 left-0 z-50 flex h-screen w-64 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-xl shadow-slate-300/30 transition-transform duration-300 lg:w-64 lg:max-w-none lg:translate-x-0 ${
            sidebarOpen
              ? "visible translate-x-0"
              : "invisible -translate-x-full lg:visible"
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
            <Link
              to="/admin/dashboard"
              onClick={closeSidebar}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-semibold text-white shadow-md shadow-slate-900/20">
                BH
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight text-slate-900">
                  Boiler House Supplies
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Admin Panel
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <p className="px-3.5 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Management
            </p>

            <nav aria-label="Admin sections" className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 font-medium text-white shadow-md shadow-slate-900/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {item.to === "/admin/enquiries" ? (
                      <EnquiriesBadge />
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogoutIcon className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:ml-64 lg:h-screen lg:overflow-y-auto">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                  aria-expanded={sidebarOpen}
                  aria-controls="admin-sidebar"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                >
                  <MenuIcon className="h-4 w-4" />
                </button>

                <p className="text-sm font-semibold text-slate-900">
                  {isEditing ? "Edit Product" : "Add Product"}
                </p>
              </div>

              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  A
                </span>
                Admin
              </span>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Catalogue
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Update this product listing for the Boiler House Supplies website."
                  : "Create a new product listing for the Boiler House Supplies website."}
              </p>
            </div>

            {loadingProduct ? (
              <div
                role="status"
                className="mt-6 space-y-5 rounded-3xl border border-white/80 bg-white/85 p-5 shadow-2xl shadow-slate-300/40 backdrop-blur-sm sm:p-8"
              >
                <span className="sr-only">Loading product...</span>
                <div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-100" />
                <div className="grid gap-5 md:grid-cols-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-12 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
                <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : productLoadError ? (
              <div
                role="alert"
                className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm leading-6 text-rose-700 shadow-sm"
              >
                <p>{productLoadError}</p>
                <button
                  type="button"
                  onClick={() => navigate("/admin/manage-products")}
                  className="mt-4 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                >
                  Back to products
                </button>
              </div>
            ) : (
            <form
              className="mt-6 rounded-3xl border border-white/80 bg-white/85 p-5 shadow-2xl shadow-slate-300/40 backdrop-blur-sm sm:p-8"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-name"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Product Name
                    <span className="ml-0.5 text-rose-500">*</span>
                  </label>

                  <input
                    id="product-name"
                    name="name"
                    type="text"
                    placeholder="Enter product name"
                    value={values.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "product-name-error" : undefined
                    }
                    className={`mt-1.5 w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.name
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                  />

                  {errors.name ? (
                    <p
                      id="product-name-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Category
                    <span className="ml-0.5 text-rose-500">*</span>
                  </label>

                  <div className="mt-1.5">
                    <SearchableCategorySelect
                      id="product-category"
                      value={values.category}
                      onChange={(next) =>
                        handleChange({
                          target: { name: "category", value: next },
                        })
                      }
                      options={categories.map((category) => ({
                        value: String(category._id),
                        label: category.name,
                      }))}
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : categories.length
                            ? "Select a category"
                            : "No categories available"
                      }
                      disabled={
                        categoriesLoading || Boolean(categoriesError)
                      }
                      invalid={Boolean(errors.category)}
                      describedBy={
                        errors.category ? "product-category-error" : undefined
                      }
                      variant="form"
                    />
                  </div>

                  {categoriesError ? (
                    <div
                      role="alert"
                      className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-rose-600"
                    >
                      <span>{categoriesError}</span>
                      <button
                        type="button"
                        onClick={handleRetryCategories}
                        className="font-semibold underline underline-offset-2 transition-colors hover:text-rose-700"
                      >
                        Retry
                      </button>
                    </div>
                  ) : null}

                  {errors.category ? (
                    <p
                      id="product-category-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.category}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="product-price"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Price
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₹
                      </span>

                      <input
                        id="product-price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={values.price}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.price)}
                        aria-describedby={
                          errors.price ? "product-price-error" : undefined
                        }
                        className={`w-full rounded-xl border bg-slate-50/70 py-3 pl-8 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                          errors.price
                            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                            : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                        }`}
                      />
                    </div>

                    <div className="relative">
                      <label htmlFor="product-price-unit" className="sr-only">
                        Price unit
                      </label>

                      <select
                        id="product-price-unit"
                        name="priceUnit"
                        value={values.priceUnit}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-3.5 pr-9 text-sm text-slate-800 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                      >
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>

                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {errors.price ? (
                    <p
                      id="product-price-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.price}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="product-moq"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Minimum Order Quantity
                    <span className="ml-0.5 text-rose-500">*</span>
                  </label>

                  <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                    <input
                      id="product-moq"
                      name="moq"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      placeholder="e.g. 10"
                      value={values.moq}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.moq)}
                      aria-describedby={
                        errors.moq ? "product-moq-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                        errors.moq
                          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                          : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                      }`}
                    />

                    <div className="relative">
                      <label htmlFor="product-moq-unit" className="sr-only">
                        MOQ unit
                      </label>

                      <select
                        id="product-moq-unit"
                        name="moqUnit"
                        value={values.moqUnit}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-3.5 pr-9 text-sm text-slate-800 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/10"
                      >
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>

                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {errors.moq ? (
                    <p
                      id="product-moq-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.moq}
                    </p>
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="product-description"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Product Description
                    <span className="ml-0.5 text-rose-500">*</span>
                  </label>

                  <RichTextEditor
                    id="product-description"
                    value={values.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe the product, material, size or application."
                    invalid={Boolean(errors.description)}
                    describedBy={
                      errors.description
                        ? "product-description-error"
                        : undefined
                    }
                  />

                  {errors.description ? (
                    <p
                      id="product-description-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {errors.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Product Images
                      <span className="ml-0.5 text-rose-500">*</span>
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Upload one or more images. JPG, PNG or WebP up to 5 MB
                      each.
                    </p>
                  </div>

                  {images.length ? (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add more
                    </button>
                  ) : null}
                </div>

                <input
                  ref={imageInputRef}
                  id="product-images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                  aria-label="Upload product images"
                  aria-describedby={
                    errors.images ? "product-images-error" : undefined
                  }
                />

                {images.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={`Product image ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            aria-label={`Remove image ${index + 1}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white hover:text-slate-900"
                          >
                            <CloseIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <p className="truncate px-2 py-1.5 text-[10px] text-slate-500">
                          {image.file?.name || "Current image"}
                        </p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-3 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
                    >
                      <PlusIcon className="h-5 w-5 text-slate-900" />
                      <span className="mt-1.5 text-xs font-medium text-slate-600">
                        Add images
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-3 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-10 text-center transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                      <UploadIcon className="h-5 w-5" />
                    </span>
                    <span className="mt-3 text-sm font-medium text-slate-700">
                      Click to upload product images
                    </span>
                    <span className="mt-1 text-xs text-slate-400">
                      Select multiple files at once
                    </span>
                  </button>
                )}

                {errors.images ? (
                  <p
                    id="product-images-error"
                    role="alert"
                    className="mt-2 text-xs text-rose-600"
                  >
                    {errors.images}
                  </p>
                ) : null}

                <div className="mt-5">
                  <p className="text-xs font-medium text-slate-700">
                    PDF Brochure
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (optional)
                    </span>
                  </p>

                  <input
                    ref={brochureInputRef}
                    id="product-brochure"
                    name="brochure"
                    type="file"
                    accept="application/pdf"
                    onChange={handleBrochureChange}
                    className="sr-only"
                    aria-label="Upload PDF brochure"
                    aria-describedby={
                      errors.brochure ? "product-brochure-error" : undefined
                    }
                  />

                  {brochure || storedBrochure ? (
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                          <FileIcon className="h-5 w-5" />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {brochure
                              ? brochure.name
                              : brochureFileName(storedBrochure)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {brochure
                              ? `${formatFileSize(brochure.size)} · New PDF selected`
                              : "Current brochure PDF"}
                          </p>

                          {storedBrochure ? (
                            <a
                              href={resolveImageUrl(storedBrochure)}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-0.5 inline-block text-xs font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                            >
                              View current PDF
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => brochureInputRef.current?.click()}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          Replace
                        </button>

                        <button
                          type="button"
                          onClick={removeBrochure}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          Remove PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => brochureInputRef.current?.click()}
                      className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-sm text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50"
                    >
                      <UploadIcon className="h-4 w-4 text-slate-900" />
                      Upload a PDF brochure
                    </button>
                  )}

                  {errors.brochure ? (
                    <p
                      id="product-brochure-error"
                      role="alert"
                      className="mt-2 text-xs text-rose-600"
                    >
                      {errors.brochure}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      YouTube Videos
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        (optional)
                      </span>
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Paste YouTube video URLs to show them in the product
                      image gallery.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addYoutubeVideo}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add video
                  </button>
                </div>

                {youtubeVideos.length ? (
                  <div className="mt-3 space-y-3">
                    {youtubeVideos.map((video, index) => {
                      const videoError = errors.youtubeVideos?.[video.id];

                      return (
                        <div
                          key={video.id}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div>
                            <label
                              htmlFor={`youtube-video-${video.id}`}
                              className="sr-only"
                            >
                              YouTube video {index + 1} URL
                            </label>

                            <input
                              id={`youtube-video-${video.id}`}
                              type="url"
                              placeholder="https://www.youtube.com/watch?v=..."
                              value={video.url}
                              onChange={(event) =>
                                handleYoutubeVideoChange(
                                  video.id,
                                  event.target.value,
                                )
                              }
                              aria-invalid={Boolean(videoError)}
                              aria-describedby={
                                videoError
                                  ? `youtube-video-error-${video.id}`
                                  : undefined
                              }
                              className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                                videoError
                                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                              }`}
                            />

                            {videoError ? (
                              <p
                                id={`youtube-video-error-${video.id}`}
                                role="alert"
                                className="mt-1 text-xs text-rose-600"
                              >
                                {videoError}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeYoutubeVideo(video.id)}
                            aria-label={`Remove YouTube video ${index + 1}`}
                            className="flex h-[46px] w-[46px] items-center justify-center justify-self-start rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-400">
                    No YouTube videos added yet.
                  </p>
                )}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Specifications
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Add only the specification rows that apply to this
                      product.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addSpecification}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Add specification
                  </button>
                </div>

                {specifications.length ? (
                  <div className="mt-3 space-y-3">
                    {specifications.map((specification, index) => {
                      const rowErrors =
                        errors.specifications?.[specification.id];

                      return (
                        <div
                          key={specification.id}
                          className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                        >
                          <div>
                            <label
                              htmlFor={`specification-name-${specification.id}`}
                              className="sr-only"
                            >
                              Specification {index + 1} name
                            </label>

                            <input
                              id={`specification-name-${specification.id}`}
                              type="text"
                              placeholder="Specification name"
                              value={specification.name}
                              onChange={(event) =>
                                handleSpecificationChange(
                                  specification.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              aria-invalid={Boolean(rowErrors?.name)}
                              aria-describedby={
                                rowErrors?.name
                                  ? `specification-name-error-${specification.id}`
                                  : undefined
                              }
                              className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                                rowErrors?.name
                                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                              }`}
                            />

                            {rowErrors?.name ? (
                              <p
                                id={`specification-name-error-${specification.id}`}
                                role="alert"
                                className="mt-1 text-xs text-rose-600"
                              >
                                {rowErrors.name}
                              </p>
                            ) : null}
                          </div>

                          <div>
                            <label
                              htmlFor={`specification-value-${specification.id}`}
                              className="sr-only"
                            >
                              Specification {index + 1} value
                            </label>

                            <input
                              id={`specification-value-${specification.id}`}
                              type="text"
                              placeholder="Specification value"
                              value={specification.value}
                              onChange={(event) =>
                                handleSpecificationChange(
                                  specification.id,
                                  "value",
                                  event.target.value,
                                )
                              }
                              aria-invalid={Boolean(rowErrors?.value)}
                              aria-describedby={
                                rowErrors?.value
                                  ? `specification-value-error-${specification.id}`
                                  : undefined
                              }
                              className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                                rowErrors?.value
                                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                  : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                              }`}
                            />

                            {rowErrors?.value ? (
                              <p
                                id={`specification-value-error-${specification.id}`}
                                role="alert"
                                className="mt-1 text-xs text-rose-600"
                              >
                                {rowErrors.value}
                              </p>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSpecification(specification.id)
                            }
                            aria-label={`Remove specification ${index + 1}`}
                            className="flex h-[46px] w-[46px] items-center justify-center justify-self-start rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-400">
                    No specifications added yet.
                  </p>
                )}
              </div>

              {submitting ? (
                <p
                  role="status"
                  className="mt-6 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-xs leading-5 text-slate-600"
                >
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
                  Saving product...
                </p>
              ) : null}

              {submitError ? (
                <p
                  role="alert"
                  className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
                >
                  <CloseIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {submitError}
                </p>
              ) : null}

              {status ? (
                <p
                  role="status"
                  className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-700"
                >
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {status}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    categoriesLoading ||
                    Boolean(categoriesError)
                  }
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting
                    ? "Saving..."
                    : isEditing
                      ? "Update Product"
                      : "Save Product"}
                </button>
              </div>
            </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
