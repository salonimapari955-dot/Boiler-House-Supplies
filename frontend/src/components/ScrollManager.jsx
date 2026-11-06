import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const initialLocation = useRef({ pathname, hash, key });

  useEffect(() => {
    const isInitialLocation =
      initialLocation.current.pathname === pathname &&
      initialLocation.current.hash === hash &&
      initialLocation.current.key === key;

    if (
      isInitialLocation &&
      pathname === "/" &&
      (hash === "#home" || hash === "#services")
    ) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      });

      return () => cancelAnimationFrame(frame);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return undefined;
  }, [pathname, hash]);

  return null;
}
