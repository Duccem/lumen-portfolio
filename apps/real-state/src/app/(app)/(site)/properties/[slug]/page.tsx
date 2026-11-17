import { ArrowLeft, MapPin } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyCard } from "@/components/sections/real-state/catalog/property-card";
import { FloorPlans } from "@/components/sections/real-state/detail/floor-plans";
import { MortgageCalculator, MoveInCost } from "@/components/sections/real-state/detail/mortgage-calculator";
import { Overview } from "@/components/sections/real-state/detail/overview";
import { PhotoMosaic } from "@/components/sections/real-state/detail/photo-mosaic";
import { SectionNav } from "@/components/sections/real-state/detail/section-nav";
import { ShareButton } from "@/components/sections/real-state/detail/share-button";
import { SmartEstimate } from "@/components/sections/real-state/detail/smart-estimate";
import { Footer } from "@/components/sections/real-state/footer";
import { Navigation } from "@/components/sections/real-state/navigation";
import { SaveButton } from "@/components/sections/real-state/saved/save-button";
import { getProperty, PROPERTIES, similarTo } from "@/lib/data/properties";
import { formatPrice } from "@/lib/format";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProperty(slug);
  if (!p) return {};
  return { title: `${p.name}, ${p.town}`, description: p.summary };
}

export default async function PropertyPage(props: PageProps<"/properties/[slug]">) {
  const { slug } = await props.params;
  const p = getProperty(slug);
  if (!p) notFound();

  const rent = p.operation === "rent";
  const sections = [
    { id: "photos", label: "Photos" },
    { id: "description", label: "Description" },
    { id: "plan", label: "House plan" },
    { id: "estimate", label: "Smart estimate" },
    { id: "costs", label: rent ? "Moving in" : "Mortgage" },
    { id: "location", label: "Location" },
  ];
  const initials = p.agent.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  const contact = `mailto:viewings@lintel.example?subject=${encodeURIComponent(`Viewing: ${p.name}, ${p.town}`)}&body=${encodeURIComponent(
    `Hello ${p.agent.name.split(" ")[0]},\n\nI would like to see ${p.name} (${formatPrice(p.price)}${rent ? " a month" : ""}).\n\nDays that suit me:\n\nThank you.`,
  )}`;

  return (
    <>
      <Navigation />
      <main className="page-x">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 pb-8 pt-8 md:pt-12">
          <h1 className="lines t-display">
            <span className="line">
              <span data-line>{p.name}</span>
            </span>
          </h1>
          <p data-rise className="t-body pb-2">
            {p.town}, {p.region} · by {p.architect}, {p.year}
          </p>
        </header>

        <PhotoMosaic photos={p.photos} name={p.name} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href={(rent ? "/properties?op=rent" : "/properties") as Route} className="group inline-flex items-center gap-2 t-small">
              <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.6} />
              <span className="link">{rent ? "To rent" : "The season"}</span>
            </Link>
            <SaveButton slug={p.slug} name={p.name} variant="text" />
            <ShareButton name={p.name} />
          </div>
          <p className="flex items-center gap-2 t-small">
            <MapPin className="size-4" strokeWidth={1.6} aria-hidden /> {p.street}, {p.town}
          </p>
        </div>

        <div className="mt-[clamp(64px,10vh,120px)] grid gap-y-28 lg:grid-cols-12 lg:gap-x-[var(--gap)] lg:gap-y-0">
          {/* Sticky price column */}
          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-10 lg:sticky lg:top-24 lg:min-h-[calc(100svh-8rem)]">
              <div data-reveal>
                <p className="tnum t-head !leading-none">{formatPrice(p.price)}</p>
                {rent && <p className="t-body mt-2">a month, furnished</p>}
                <a href="#costs" className="link link-on t-body mt-4">
                  {rent ? "What it costs to move in" : "Calculate the mortgage"}
                </a>
              </div>

              <div data-reveal className="flex max-w-sm items-center gap-4 bg-surface p-3" style={{ ["--i" as string]: 1 }}>
                <span className="grid size-12 shrink-0 place-items-center bg-ink text-bg" aria-hidden>
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-body truncate">{p.agent.name}</p>
                  <a href={`tel:${p.agent.phone.replace(/\s/g, "")}`} className="link t-small text-soft">
                    {p.agent.phone}
                  </a>
                </div>
                <a href={contact} className="btn">
                  Book a viewing
                </a>
              </div>

              <div className="mt-auto hidden lg:block">
                <SectionNav sections={sections} />
              </div>
            </div>
          </aside>

          <div className="space-y-[clamp(96px,14vh,160px)] lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-6">
            <Overview property={p} />

            <section id="plan" className="scroll-mt-28" aria-label="House plan">
              <FloorPlans plans={p.plans} />
            </section>

            <section id="estimate" className="scroll-mt-28" aria-labelledby="estimate-title">
              <h2 id="estimate-title" className="t-head mb-8">
                Smart estimate
              </h2>
              <SmartEstimate property={p} />
            </section>

            <section id="costs" className="scroll-mt-28" aria-labelledby="costs-title">
              <h2 id="costs-title" className="t-head mb-8">
                {rent ? "What it costs to move in" : "What it costs each month"}
              </h2>
              {rent ? <MoveInCost property={p} /> : <MortgageCalculator property={p} />}
            </section>

            <section id="location" className="scroll-mt-28" aria-labelledby="location-title">
              <h2 id="location-title" className="t-head mb-8">
                {p.town}, by car
              </h2>
              <div className="grid gap-8 sm:grid-cols-[1fr_1.1fr] sm:items-end">
                <dl className="space-y-5">
                  {p.distances.map((d, i) => (
                    <div key={d.label} data-reveal className="flex items-baseline gap-5" style={{ ["--i" as string]: i }}>
                      <dt className="tnum t-lead w-36 shrink-0">{d.value}</dt>
                      <dd className="t-body">{d.label}</dd>
                    </div>
                  ))}
                </dl>
                <div className="shutter photo relative aspect-[4/5]">
                  <Image src={p.cover.src} alt={p.cover.alt} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover object-[30%_50%] scale-125" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <section className="mb-[clamp(120px,18vh,200px)] mt-[clamp(120px,18vh,220px)]" aria-labelledby="similar-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 id="similar-title" data-reveal className="t-head">
              Close in price
            </h2>
            <Link href={(rent ? "/properties?op=rent" : "/properties") as Route} className="link t-small">
              See the whole season
            </Link>
          </div>
          <div className="grid gap-x-[var(--gap)] gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {similarTo(p).map((s, i) => (
              <PropertyCard key={s.slug} property={s} index={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
