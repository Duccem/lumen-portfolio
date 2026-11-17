import Image from "next/image";

import { SeaLoop } from "@/components/motion/sea-loop";

const STRIP = [
  { src: "/images/homes/elm-pavilion.jpg", alt: "Black and timber pavilions under an old elm in Begur" },
  { src: "/video/sea-surface.webm", alt: "" },
  { src: "/images/homes/slate-house.jpg", alt: "Slate-clad house with timber slats lit at night in Grândola" },
];

const MAIL =
  "mailto:viewings@lintel.example?subject=" +
  encodeURIComponent("A private viewing") +
  "&body=" +
  encodeURIComponent("Hello Lintel,\n\nWe are looking for a house on the coast. A little about how we live:\n\nBedrooms:\nRegion:\nBudget:\nBest days for a viewing:\n\nThank you.");

/** Three photographs butted together, then the close on a flat field. The underlined phrase is the action. */
export function ViewingCta() {
  return (
    <section id="viewing" className="mt-[clamp(140px,24vh,260px)] scroll-mt-20" aria-labelledby="viewing-title">
      <div className="grid grid-cols-2 md:grid-cols-3">
        {STRIP.map((s, i) => (
          <div
            key={s.src}
            className={`shutter photo relative ${i === 0 ? "col-span-2 aspect-[4/3] md:col-span-1 md:aspect-auto" : "aspect-[4/3] md:aspect-auto"} md:h-[40svh]`}
            style={{ ["--i" as string]: i }}
          >
            {i === 1 ? (
              <SeaLoop className="absolute inset-0 size-full object-cover" />
            ) : (
              <Image src={s.src} alt={s.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
            )}
          </div>
        ))}
      </div>

      <div className="page-x grid-12 relative min-h-[44svh] bg-surface pb-44 pt-14 md:py-20">
        <div className="col-span-12 md:col-span-7">
          <h2 id="viewing-title" className="sr-only">
            Book a private viewing
          </h2>
          <p data-reveal className="t-lead max-w-[30ch]">
            Tell us how you want to live, and we will{" "}
            <a href={MAIL} className="underline decoration-[4px] underline-offset-[6px] transition-[text-decoration-color,color] duration-200 hover:decoration-soft">
              walk you through the houses that fit
            </a>
            .
          </p>
          <p data-reveal className="t-body mt-8" style={{ ["--i" as string]: 1 }}>
            Viewings Tuesday to Saturday, 10:00 to 18:00.
            <br />
            Or call us on <a className="link text-ink" href="tel:+351210040120">+351 210 040 120</a>.
          </p>
        </div>
        <div className="shutter photo absolute bottom-10 right-[var(--margin)] aspect-[4/5] w-24 md:w-[150px]" style={{ ["--i" as string]: 2 }}>
          <Image src="/images/rooms/lounge-warm.jpg" alt="A warm lounge with a long window and rattan chairs" fill sizes="150px" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
