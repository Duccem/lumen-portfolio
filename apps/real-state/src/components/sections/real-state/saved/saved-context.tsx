"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SavedContextValue = {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
};

const SavedContext = createContext<SavedContextValue | null>(null);
const KEY = "lintel:saved";

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSaved(JSON.parse(raw) as string[]);
    } catch {
      /* storage unavailable: saved homes simply last for this visit */
    }
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const nowSaved = !saved.includes(slug);
      const next = nowSaved ? [...saved, slug] : saved.filter((s) => s !== slug);
      setSaved(next);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return nowSaved;
    },
    [saved],
  );

  const value = useMemo(
    () => ({ saved, isSaved: (slug: string) => saved.includes(slug), toggle }),
    [saved, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
