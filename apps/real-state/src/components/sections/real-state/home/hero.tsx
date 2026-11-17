import { ArrowRight, ChevronDown } from "lucide-react";
import Form from "next/form";
import Image from "next/image";

import { REGIONS, TYPES } from "@/lib/data/properties";

const MAX_PRICES = [
  { value: "", label: "Any price" },
  { value: "1000000", label: "Up to €1m" },
  { value: "1500000", label: "Up to €1.5m" },
  { value: "2000000", label: "Up to €2m" },
  { value: "3000000", label: "Up to €3m" },
];

/**
 * One framed photograph carries the first screen. The headline sits on it bottom-left;
 * the search is cut into the bottom-right corner and works without script (a plain GET form).
 */
export function Hero() {
  return (
    <section className="page-x pb-4" aria-labelledby="hero-title">
      <div className="relative" style={{ ["--panel-h" as string]: "88px" }}>
        <div className="photo hero-photo relative h-[min(78svh,760px)] min-h-[520px] md:h-[calc(100svh-88px)] md:max-h-[920px]">
          <Image
            src="/images/homes/aster-house.jpg"
            alt="Aster House in Sintra: dark timber and lit glass under a cork oak at dusk"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_45%]"
          />
          {/* Flat neutral scrim so the type holds on the photograph */}
          <div className="absolute inset-0 bg-[#141a04]/30" aria-hidden />

          <div className="absolute inset-x-0 bottom-0 grid gap-6 p-5 text-bg md:p-10 md:pb-[calc(var(--panel-h)+48px)] lg:grid-cols-12 lg:items-end">
            <h1 id="hero-title" className="lines t-display max-md:!text-[13vw] md:[&_.line]:whitespace-nowrap lg:col-span-9">
              <span className="line">
                <span data-line style={{ ["--i" as string]: 0 }}>
                  Signed houses
                </span>
              </span>
              <span className="line">
                <span data-line style={{ ["--i" as string]: 1 }}>
                  by the sea
                </span>
              </span>
            </h1>
            <p
              data-rise
              className="t-body max-w-[34ch] lg:col-span-3 lg:col-start-10 lg:mb-2"
              style={{ ["--i" as string]: 0 }}
            >
              Twelve architect-signed homes on the Iberian coast this autumn, each one visited twice before it reaches this page.
            </p>
          </div>
        </div>

        {/* The search, notched into the photograph's corner on wide screens */}
        <div className="relative md:absolute md:bottom-0 md:left-[8%] md:right-0 md:bg-bg md:pl-4 md:pt-4 lg:left-auto">
          <div data-rise style={{ ["--i" as string]: 2 }}>
            <Form
              action="/properties"
              className="grid grid-cols-2 bg-field text-field-ink sm:grid-cols-[1fr_1fr_1fr_auto] md:w-full lg:w-[min(760px,62vw)] [&>label:first-child]:max-sm:col-span-2"
              aria-label="Search the season"
            >
              <HeroSelect name="region" label="Location" options={[{ value: "", label: "Anywhere" }, ...REGIONS.map((r) => ({ value: r, label: r }))]} />
              <HeroSelect name="type" label="Kind of house" options={[{ value: "", label: "Any kind" }, ...TYPES.map((t) => ({ value: t.value, label: t.label }))]} />
              <HeroSelect name="max" label="Max price" options={MAX_PRICES} />
              <button
                type="submit"
                className="group col-span-2 flex min-h-[64px] items-center sm:col-span-1 justify-center gap-2 bg-bg px-6 text-ink transition-[background-color,transform] duration-200 hover:bg-surface active:scale-[0.97] sm:m-3 sm:min-h-0 sm:px-5"
              >
                <span className="t-body sm:sr-only">Search houses</span>
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.6} aria-hidden />
              </button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSelect({ name, label, options }: { name: string; label: string; options: { value: string; label: string }[] }) {
  return (
    <label className="group relative flex cursor-pointer flex-col justify-center px-5 py-3.5 transition-colors duration-200 hover:bg-[#2f3a0c] sm:min-h-[88px]">
      <span className="t-small opacity-80">{label}</span>
      <span className="relative mt-0.5 flex items-center">
        <select
          name={name}
          defaultValue=""
          className="t-body w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-field-ink focus-visible:outline-none [&>option]:text-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 size-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={1.6} aria-hidden />
      </span>
      {/* Focus mark drawn in under the active field */}
      <span className="pointer-events-none absolute bottom-2 left-5 right-5 h-[2px] origin-left scale-x-0 bg-field-ink transition-transform duration-300 group-focus-within:scale-x-100" aria-hidden />
    </label>
  );
}
