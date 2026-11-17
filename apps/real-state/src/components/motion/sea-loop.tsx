"use client";

import { useEffect, useRef } from "react";

/** Silent loop of the Atlantic. Holds on its poster frame when motion is reduced or it is off screen. */
export function SeaLoop({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting && !reduce.matches) void v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      poster="/video/sea-surface-poster.jpg"
      width={854}
      height={480}
      aria-hidden
    >
      <source src="/video/sea-surface.webm" type="video/webm" />
    </video>
  );
}
