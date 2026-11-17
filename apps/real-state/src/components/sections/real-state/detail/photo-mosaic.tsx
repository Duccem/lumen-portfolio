"use client";

import { ArrowLeft, ArrowRight, Images, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import type { Photo } from "@/lib/data/properties";

export function PhotoMosaic({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [a, b, c, d] = photos;

  const tile = (p: Photo | undefined, i: number, className: string, sizes: string, priority = false) =>
    p && (
      <button
        type="button"
        onClick={() => setOpen(i)}
        className={`shutter photo zoom group relative block w-full cursor-zoom-in ${className}`}
        style={{ ["--i" as string]: i }}
        aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.caption}`}
      >
        <Image src={p.src} alt={p.alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </button>
    );

  return (
    <>
      <div id="photos" className="grid scroll-mt-24 grid-cols-2 gap-2 md:grid-cols-[1.9fr_1fr_1fr] md:grid-rows-[1fr_1fr] md:gap-2.5">
        {tile(a, 0, "col-span-2 aspect-[4/3] md:col-span-1 md:row-span-2 md:aspect-auto md:h-full md:min-h-[min(62svh,640px)]", "(min-width:768px) 50vw, 100vw", true)}
        {tile(b, 1, "aspect-[4/3] md:aspect-auto md:h-full", "(min-width:768px) 25vw, 50vw", true)}
        <div className="relative max-md:hidden md:row-span-2">
          {tile(d, 3, "h-full", "25vw")}
          <button
            type="button"
            onClick={() => setOpen(0)}
            className="btn absolute inset-x-0 bottom-0 justify-between"
          >
            <span className="flex items-center gap-2">
              <Images className="size-4" strokeWidth={1.6} /> Show all photos
            </span>
            <span className="tnum opacity-70">{photos.length}</span>
          </button>
        </div>
        {tile(c, 2, "aspect-[4/3] md:aspect-auto md:h-full", "(min-width:768px) 25vw, 50vw")}
        <button type="button" onClick={() => setOpen(0)} className="btn btn-quiet col-span-2 justify-between md:hidden">
          <span className="flex items-center gap-2">
            <Images className="size-4" strokeWidth={1.6} /> Show all photos
          </span>
          <span className="tnum">{photos.length}</span>
        </button>
      </div>

      {open !== null && <Lightbox photos={photos} start={open} name={name} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({ photos, start, name, onClose }: { photos: Photo[]; start: number; name: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [shown, setShown] = useState(false);
  const go = useCallback((d: number) => setI((n) => (n + d + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  const p = photos[i]!;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-[#161b04] text-bg transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photographs`}
    >
      <div className="flex h-16 items-center justify-between px-5 md:px-8">
        <p className="t-small tnum">
          {i + 1} / {photos.length} · {p.caption}
        </p>
        <button type="button" onClick={onClose} className="grid size-11 place-items-center transition-transform duration-150 active:scale-90" aria-label="Close photographs" autoFocus>
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative flex-1">
        {photos.map((ph, n) => (
          <Image
            key={ph.src + n}
            src={ph.src}
            alt={n === i ? ph.alt : ""}
            fill
            sizes="100vw"
            className={`object-contain px-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-24 ${n === i ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0"}`}
          />
        ))}
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-bg/10 transition-[background-color,transform] hover:bg-bg/20 active:scale-90 md:left-6">
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-bg/10 transition-[background-color,transform] hover:bg-bg/20 active:scale-90 md:right-6">
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4">
        {photos.map((ph, n) => (
          <button
            key={ph.src + n}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Photo ${n + 1}`}
            aria-current={n === i}
            className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity duration-200 ${n === i ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
          >
            <Image src={ph.src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
