"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ name }: { name: string }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} · Lintel`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      /* the visitor closed the share sheet */
    }
  };
  return (
    <button type="button" onClick={share} className="group inline-flex items-center gap-2 t-small transition-transform duration-150 active:scale-95">
      <Share className="size-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.6} aria-hidden />
      <span className="link">Share</span>
    </button>
  );
}
