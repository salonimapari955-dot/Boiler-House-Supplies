import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../api.js";
import { getAdminToken } from "../auth.js";

const ENQUIRIES_UPDATED_EVENT = "admin:enquiries-updated";
const POLL_INTERVAL_MS = 15000;

function isUnread(enquiry) {
  return (enquiry?.status ?? "new") !== "read";
}

/**
 * Tell the sidebar badge that enquiry statuses changed so it can refresh
 * immediately instead of waiting for the next poll.
 */
export function notifyEnquiriesUpdated() {
  window.dispatchEvent(new Event(ENQUIRIES_UPDATED_EVENT));
}

/**
 * Keeps the number of new/unread enquiries in sync while an admin page is
 * open. The list is polled so enquiries submitted from the public website
 * appear without a page refresh, and local status changes trigger an
 * immediate refresh through `notifyEnquiriesUpdated`.
 */
export function useUnreadEnquiries() {
  const [unreadCount, setUnreadCount] = useState(0);
  const mountedRef = useRef(false);
  const latestRequestRef = useRef(0);

  const loadUnreadCount = useCallback(async (signal) => {
    const token = getAdminToken();

    if (!token) return;

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    try {
      const response = await api.get("/enquiries", {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = response.data?.enquiries;

      if (
        !mountedRef.current ||
        signal?.aborted ||
        requestId !== latestRequestRef.current ||
        !Array.isArray(records)
      ) {
        return;
      }

      setUnreadCount(records.filter(isUnread).length);
    } catch (error) {
      // Keep the last known count when the API is temporarily unavailable.
      if (error?.code === "ERR_CANCELED" || signal?.aborted) return;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    // The initial request sets state asynchronously once the API responds.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUnreadCount(controller.signal);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadUnreadCount();
      }
    }, POLL_INTERVAL_MS);

    function handleRefresh() {
      loadUnreadCount();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadUnreadCount();
      }
    }

    window.addEventListener(ENQUIRIES_UPDATED_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      controller.abort();
      window.clearInterval(intervalId);
      window.removeEventListener(ENQUIRIES_UPDATED_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadUnreadCount]);

  return unreadCount;
}
