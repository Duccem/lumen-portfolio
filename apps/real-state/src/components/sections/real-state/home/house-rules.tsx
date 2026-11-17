import Image from "next/image";

const RULES = [
  { figure: "12", text: "houses a season, never more. When one sells, its place stays empty until spring." },
  { figure: "2", text: "visits before a house is listed: one with the architect's drawings, one at dusk." },
  { figure: "48 h", text: "to answer a viewing request, by the agent who will open the door." },
  { figure: "1", text: "agent per house, from the first call to the day you take the keys." },
];

/** The rules the season is built on, stated without raising the voice. */
export function HouseRules() {
  return (
    <section className="page-x grid-12 my-[clamp(140px,22vh,260px)]" aria-labelledby="rules-title">
      <div className="col-span-12 md:col-span-6 md:col-start-2">
        <h2 id="rules-title" data-reveal className="t-lead ml-[calc(88px+24px)] md:ml-[calc(132px+24px)]">
          How we list
        </h2>
        <dl className="mt-14 space-y-7">
          {RULES.map((r, i) => (
            <div key={r.figure} data-reveal className="grid grid-cols-[88px_1fr] items-baseline gap-x-6 md:grid-cols-[132px_1fr]" style={{ ["--i" as string]: i }}>
              <dt className="tnum t-lead justify-self-end font-medium">{r.figure}</dt>
              <dd className="t-body max-w-[40ch]">{r.text}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="shutter photo relative col-span-7 col-start-6 mt-14 aspect-square md:col-span-3 md:col-start-9 md:mt-20">
        <Image src="/images/rooms/hall-white.jpg" alt="Double-height white entrance hall with a fireplace and a gallery" fill sizes="(min-width:768px) 25vw, 56vw" className="object-cover" />
      </div>
    </section>
  );
}
