"use client";

import { useEffect, useRef, useState } from "react";

/** Eases a displayed number toward its target, so changing figures roll instead of jump. */
export function useTween(target: number, duration = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const current = useRef(target);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      current.current = target;
      setValue(target);
      return;
    }
    from.current = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      current.current = from.current + (target - from.current) * eased;
      setValue(current.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
