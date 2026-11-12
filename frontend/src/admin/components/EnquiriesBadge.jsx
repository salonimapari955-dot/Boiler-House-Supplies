import { useUnreadEnquiries } from "../hooks/useUnreadEnquiries.js";

/**
 * Sidebar notification badge showing only the number of new/unread enquiries.
 * It hides itself when there is nothing unread.
 */
export default function EnquiriesBadge() {
  const unreadCount = useUnreadEnquiries();

  if (unreadCount <= 0) return null;

  return (
    <span
      className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-semibold leading-none text-white tabular-nums"
      aria-label={`${unreadCount} unread ${
        unreadCount === 1 ? "enquiry" : "enquiries"
      }`}
    >
      {unreadCount}
    </span>
  );
}
