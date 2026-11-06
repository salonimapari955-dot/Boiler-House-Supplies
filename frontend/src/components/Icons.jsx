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

export function FileCheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M14.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="m9 15 2 2 4-4" />
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

export function GaugeIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M4 17.5a8.5 8.5 0 1 1 16 0" />
      <path d="m12 17.5 4.2-6" />
      <circle cx="12" cy="17.5" r="1.2" />
    </svg>
  );
}

export function GrateIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="3.2" y="4.5" width="17.6" height="15" />
      <path d="M3.2 9.5h17.6M3.2 14.5h17.6M9 4.5v15M15 4.5v15" />
    </svg>
  );
}

export function ValveIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 7.8V4.4M9.4 4.4h5.2" />
      <path d="M2.2 12h5.6M16.2 12h5.6M2.2 9.8v4.4M21.8 9.8v4.4" />
    </svg>
  );
}

export function BricksIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 9.7h18M3 14.3h18" />
      <path d="M9 5v4.7M15 9.7v4.6M9 14.3V19" />
    </svg>
  );
}

export function TruckIcon({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="M3 6.5h9.5v10H3z" />
      <path d="M12.5 10h3.6l3.9 3.6v2.9h-7.5" />
      <circle cx="7.4" cy="18" r="1.7" />
      <circle cx="17.2" cy="18" r="1.7" />
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

export function BuildingIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="4" y="3.5" width="16" height="17" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      <path d="M10 20.5v-3h4v3" />
    </svg>
  );
}

export function UsersIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.4-3.5 2.6-5.5 5.5-5.5s5.1 2 5.5 5.5" />
      <path d="M15.5 5.3a3 3 0 0 1 0 5.4M17 14.8c2 .6 3.2 2.4 3.5 5.2" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5Z" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" />
    </svg>
  );
}

export function BankIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <path d="m3 9 9-5 9 5" />
      <path d="M3.5 9h17M5.5 20V10M9.5 20V10M14.5 20V10M18.5 20V10" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function BriefcaseIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...baseProps}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="1.5" />
      <path d="M8.5 7.5V5.5h7v2" />
      <path d="M3 12.5h18M10 12.5v2h4v-2" />
    </svg>
  );
}
