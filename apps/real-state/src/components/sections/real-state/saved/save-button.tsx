"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useSaved } from "./saved-context";

type Props = {
  slug: string;
  name: string;
  /** "icon" sits on a photograph; "text" is the labelled action on the detail page. */
  variant?: "icon" | "text";
  className?: string;
};

export function SaveButton({ slug, name, variant = "icon", className = "" }: Props) {
  const { isSaved, toggle } = useSaved();
  const [pop, setPop] = useState(0);
  const saved = isSaved(slug);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggle(slug);
    setPop((n) => n + 1);
    toast(now ? `${name} saved` : `${name} removed from saved`);
  };

  const heart = (
    <Heart
      key={pop}
      aria-hidden
      className={`size-[18px] transition-colors duration-200 ${pop ? "heart-pop" : ""}`}
      fill={saved ? "currentColor" : "none"}
      strokeWidth={1.6}
    />
  );

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`group inline-flex items-center gap-2 t-small transition-transform duration-150 active:scale-95 ${className}`}
      >
        {heart}
        <span className="link">{saved ? "Saved" : "Save"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      className={`grid size-11 place-items-center bg-bg/90 text-ink transition-[transform,background-color] duration-150 hover:bg-bg active:scale-90 ${className}`}
    >
      {heart}
    </button>
  );
}
