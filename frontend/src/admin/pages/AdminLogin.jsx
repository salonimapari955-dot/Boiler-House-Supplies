import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import { setAdminToken } from "../auth.js";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function LockIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2.5" />
    </svg>
  );
}

function validate(values) {
  const next = {};

  if (!values.email.trim()) {
    next.email = "Enter your email address.";
  }

  
  if (!values.password.trim()) {
    next.password = "Enter your password.";
  }

  return next;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setStatus("");
    setIsError(false);

    setErrors((current) => {
      if (!current[name]) return current;
      return { ...current, [name]: "" };
    });
  }

  function handleBlur(event) {
    const { name, value } = event.target;

    if (!value.trim()) {
      setErrors((current) => ({
        ...current,
        [name]:
          name === "email"
            ? "Enter your email address."
            : "Enter your password.",
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const next = validate(values);
    setErrors(next);

    if (next.email) {
      document.getElementById("admin-email")?.focus();
      setStatus("");
      return;
    }

    if (next.password) {
      document.getElementById("admin-password")?.focus();
      setStatus("");
      return;
    }

    setLoading(true);
    setStatus("");
    setIsError(false);

    try {
      const response = await api.post("/admin/login", {
        email: values.email.trim(),
        password: values.password,
      });

      setAdminToken(response.data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      setIsError(true);
      setStatus(
        error.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 px-4 py-10 font-sans text-slate-600 selection:bg-slate-900 selection:text-white [&_a:focus-visible]:outline-slate-900 [&_button:focus-visible]:outline-slate-900 [&_input:focus-visible]:outline-slate-900">
      <div
        className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-slate-300/50 backdrop-blur-sm">
          <div
            className="h-1 bg-gradient-to-r from-slate-900 via-slate-700 to-sky-400"
            aria-hidden="true"
          />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/25">
                <LockIcon className="h-5 w-5" />
              </span>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Boiler House Supplies
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Admin Login
              </h1>
            </div>

            <form className="mt-7 space-y-4" noValidate onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-medium text-slate-600"
                >
                  Email
                </label>

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@boilerhouse.in"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "admin-email-error" : undefined
                  }
                  className={`mt-1.5 w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                  }`}
                />

                {errors.email ? (
                  <p
                    id="admin-email-error"
                    role="alert"
                    className="mt-1 text-xs text-rose-600"
                  >
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-slate-600"
                >
                  Password
                </label>

                <div className="relative mt-1.5">
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "admin-password-error" : undefined
                    }
                    className={`w-full rounded-xl border bg-slate-50/70 py-3 pl-3.5 pr-16 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.password
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password ? (
                  <p
                    id="admin-password-error"
                    role="alert"
                    className="mt-1 text-xs text-rose-600"
                  >
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {status ? (
                <p
                  role={isError ? "alert" : "status"}
                  className={`rounded-xl border px-3 py-2.5 text-xs leading-5 ${
                    isError
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-sky-100 bg-sky-50 text-slate-600"
                  }`}
                >
                  {status}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
