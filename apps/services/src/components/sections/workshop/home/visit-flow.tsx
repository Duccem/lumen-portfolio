import Link from "next/link";

/**
 * Many into one: the symptoms a car arrives with (scattered), pressed into one quote (a ribbon),
 * released as an ordered list of finished work (rows in crimson). One repeated shape, no arrows.
 */

type Sq = { u: number; v: number; kind: "loose-a" | "loose-b" | "ribbon" | "done" };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function squares(): Sq[] {
  const r = rng(7);
  const out: Sq[] = [];
  for (let i = 0; i < 46; i++) {
    const u = r() * 0.33;
    const pinch = 1 - 0.8 * Math.pow(u / 0.33, 2.2);
    out.push({ u, v: (r() * 2 - 1) * pinch * 0.92, kind: r() > 0.45 ? "loose-a" : "loose-b" });
  }
  for (let c = 0; c < 16; c++) for (let row = 0; row < 3; row++) out.push({ u: 0.37 + (c * 0.26) / 15, v: row - 1, kind: "ribbon" });
  for (let c = 0; c < 8; c++) for (let row = 0; row < 6; row++) out.push({ u: 0.7 + (c * 0.28) / 7, v: -0.78 + (row * 1.56) / 5, kind: "done" });
  return out;
}

const SQS = squares();
const FILL = { "loose-a": "var(--surface-3)", "loose-b": "var(--mid)", ribbon: "var(--field-1)", done: "var(--accent)" };

function Diagram({ vertical }: { vertical: boolean }) {
  const W = vertical ? 300 : 1350;
  const H = vertical ? 400 : 300;
  const s = vertical ? 10 : 12;
  const pitch = s + 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="flow h-auto w-full" aria-hidden>
      {SQS.map((q, i) => {
        const along = q.u * (vertical ? H - s : W - s);
        const half = (vertical ? W : H) / 2;
        const across = q.kind === "ribbon" ? half + q.v * pitch - s / 2 : half + q.v * (half - s) - s / 2;
        const x = vertical ? across : along;
        const y = vertical ? along : across;
        return (
          <rect
            key={i}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            width={s}
            height={s}
            rx={2}
            fill={FILL[q.kind]}
            style={{ transitionDelay: `${Math.round(q.u * 1100)}ms` }}
          />
        );
      })}
    </svg>
  );
}

const PHASES = [
  { name: "Drop off", text: "Bring the car and describe the noise. Every symptom goes on the job card." },
  { name: "One quote", text: "The inspection turns into one price. You approve it from your phone, or you don't." },
  { name: "Done right", text: "Work, road test, printed report. Collect when your tag says ready." },
];

export function VisitFlow() {
  return (
    <section className="page-x mt-[clamp(120px,14vw,200px)]" aria-labelledby="flow-title">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-2">
        <h2 id="flow-title" data-reveal className="t-head lg:col-span-4">
          How a visit
          <br />
          runs
        </h2>
        <p data-reveal className="max-w-[44ch] t-body lg:col-span-4 lg:col-start-1" style={{ ["--i" as string]: 1 }}>
          Whatever is wrong arrives as a handful of symptoms. It leaves as one approved price and a list of what was
          done. You can watch each of the seven stages on the{" "}
          <Link href="/track" className="link font-medium">
            job card
          </Link>
          .
        </p>
      </div>

      {/* Desktop: left to right */}
      <div className="mt-12 hidden md:block">
        <Diagram vertical={false} />
        <ol className="mt-8 grid grid-cols-3 gap-2">
          {PHASES.map((p, i) => (
            <li key={p.name} data-reveal style={{ ["--i" as string]: i + 2 }} className="max-w-[34ch]">
              <h3 className="t-body font-medium">{p.name}</h3>
              <p className="mt-1 t-body">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Phone: top to bottom, names level with their zones */}
      <div className="mt-10 grid grid-cols-[1fr_44vw] gap-4 md:hidden">
        <Diagram vertical />
        <ol className="grid grid-rows-3">
          {PHASES.map((p) => (
            <li key={p.name} className="self-center">
              <h3 className="t-body font-medium">{p.name}</h3>
              <p className="mt-1 t-small">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
