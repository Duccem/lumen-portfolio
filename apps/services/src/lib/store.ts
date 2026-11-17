"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed store. Everything this site remembers (tickets,
 * the parts basket, quote approvals) lives in the visitor's own browser.
 * Reads and writes are wrapped so a private window or blocked storage still works,
 * just without memory between visits.
 */
export function createStore<T>(key: string, initial: T) {
  let cache: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) cache = JSON.parse(raw) as T;
    } catch {
      /* storage unavailable: keep the in-memory value */
    }
  };

  const get = () => {
    load();
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    load();
    cache = typeof next === "function" ? (next as (prev: T) => T)(cache) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        loaded = false;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  // Defined outside the hook body: the React Compiler hoists inline callbacks out of this closure.
  const getServer = () => initial;
  const useValue = () => useSyncExternalStore(subscribe, get, getServer);

  return { get, set, subscribe, useValue };
}

/** The current time, refreshed on an interval, null until mounted (avoids hydration drift). */
export function useNow(every = 15000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), every);
    return () => window.clearInterval(id);
  }, [every]);
  return now;
}
