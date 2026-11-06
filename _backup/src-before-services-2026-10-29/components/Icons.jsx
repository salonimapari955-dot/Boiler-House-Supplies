const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function ArrowRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function MenuIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M6.6 3.5h2.2l1.2 4.4-2 1.4a14.7 14.7 0 0 0 6.7 6.7l1.4-2 4.4 1.2v2.2a2.1 2.1 0 0 1-2.3 2.1A17.9 17.9 0 0 1 4.5 5.8a2.1 2.1 0 0 1 2.1-2.3Z" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6.2 8.5-6.2" />
    </svg>
  );
}

export function MapPinIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M20 10.2c0 5.4-8 11.3-8 11.3s-8-5.9-8-11.3a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.7" />
    </svg>
  );
}

export function ShieldCheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M12 3.2 20 6v5.7c0 4.6-3.4 7.7-8 9.1-4.6-1.4-8-4.5-8-9.1V6l8-2.8Z" />
      <path d="m8.5 12 2.4 2.4 4.6-4.8" />
    </svg>
  );
}

export function StarIcon({
  className = "h-4 w-4",
  filled = false,
  strokeWidth = 1.6,
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3.7 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.7Z" />
    </svg>
  );
}

export function QuoteIcon({ className = "h-8 w-8" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.6 5.4c-3.1 1.6-4.9 4-4.9 7.3V19h6.1v-6.2H7.5c.1-1.9.9-3.2 2.6-4.2l-.5-3.2Zm9 0c-3.1 1.6-4.9 4-4.9 7.3V19h6.1v-6.2h-3.3c.1-1.9.9-3.2 2.6-4.2l-.5-3.2Z" />
    </svg>
  );
}

export function PackageIcon({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m12 3.3 8 4.2v9L12 20.7l-8-4.2v-9l8-4.2Z" />
      <path d="m4.4 7.7 7.6 4.1 7.6-4.1M12 11.8v8.5" />
    </svg>
  );
}

export function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function SendIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m21 3-7.2 18-3.4-7.4L3 10.2 21 3Z" />
      <path d="m10.4 13.6 4.1-4.1" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
