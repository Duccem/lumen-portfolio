"use client";

import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DEMO_IDS, normaliseId } from "@/lib/tickets";

import { KeyTag } from "./key-tag";

/**
 * Type the number on your key tag; the tag on screen takes the number as you type it.
 * Without script the form still submits to /track as a plain GET.
 */
export function TrackerForm({ tone = "paper", initial = "", showTag = true }: { tone?: "paper" | "dark"; initial?: string; showTag?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [swing, setSwing] = useState(0);
  const digits = value.replace(/\D/g, "").slice(0, 4);
  const parsed = normaliseId(value);
  const tagId = parsed ? `${parsed.prefix ?? "B7"}-${parsed.digits}` : digits.padEnd(4, "·");

  return (
    <div className={`flex h-full flex-col gap-6 sm:flex-row sm:items-stretch ${tone === "paper" ? "on-field" : ""}`}>
      {showTag ? (
        <div className="flex shrink-0 items-start justify-center sm:w-[38%]">
          <KeyTag id={tagId} tone="crimson" key={swing} swing={swing > 0} className="w-[min(150px,40vw)] sm:w-full sm:max-w-[190px]" />
        </div>
      ) : null}
      <form
        action="/track"
        className="flex min-w-0 flex-1 flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!parsed) {
            setSwing((n) => n + 1);
            return;
          }
          router.push(`/track?t=${parsed.prefix ?? ""}${parsed.prefix ? "-" : ""}${parsed.digits}` as Route);
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="t-small font-medium">Key tag or ticket number</span>
          <input
            name="t"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.replace(/\D/g, "").length === 4) setSwing((n) => n + 1);
            }}
            inputMode="text"
            autoComplete="off"
            placeholder="B7-2048"
            className="field tnum text-[22px]"
            aria-describedby="tracker-help"
          />
        </label>
        <button type="submit" className="btn group w-full">
          Find my car
          <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
        </button>
        <p id="tracker-help" className={`t-small ${tone === "paper" ? "text-field-soft" : "text-soft"}`}>
          No tag yet? Try a sample:{" "}
          {DEMO_IDS.map((id, i) => (
            <span key={id}>
              <Link href={{ pathname: "/track", query: { t: id } }} className="link tnum font-medium">
                {id}
              </Link>
              {i < DEMO_IDS.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </form>
    </div>
  );
}
