import { useEffect, useRef, useState } from "react";

function shouldShowImmediately() {
  if (typeof window === "undefined") return true;

  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  );
}

/**
 * Reveals content when it enters the viewport.
 * Falls back to visible content when reduced motion is requested.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  variant = "up",
  waitForUserScroll = false,
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(shouldShowImmediately);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (!waitForUserScroll || userScrolled || visible) return undefined;

    const handleWheel = (event) => {
      if (event.deltaY > 0) setUserScrolled(true);
    };
    const handleTouchMove = () => setUserScrolled(true);
    const handleKeyDown = (event) => {
      if (["ArrowDown", "PageDown", " ", "End"].includes(event.key)) {
        setUserScrolled(true);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [userScrolled, visible, waitForUserScroll]);

  useEffect(() => {
    if (visible || (waitForUserScroll && !userScrolled)) return undefined;

    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, userScrolled, waitForUserScroll]);

  return (
    <Tag
      ref={elementRef}
      className={`reveal reveal--${variant} ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
