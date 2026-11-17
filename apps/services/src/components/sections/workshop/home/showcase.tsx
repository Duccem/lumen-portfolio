import { ArrowRight } from "lucide-react";
import Link from "next/link";

const IMG = "/images/brake-disc.jpg";

type Cell =
  | { kind: "photo" }
  | { kind: "heading" }
  | { kind: "fact"; text: string; tone: string }
  | { kind: "action" };

const FACTS = [
  { text: "Brake discs measured with a micrometer, not by eye.", tone: "bg-field text-field-ink" },
  { text: "Every wheel bolt torqued to the maker's figure.", tone: "bg-surface-3 text-ink" },
  { text: "Fluids drained and refilled, never just topped up.", tone: "bg-mid text-field-ink" },
];

/** Desktop board: 6 × 4. Colour tiles never touch each other. Heading spans two cells. */
function desktopCells() {
  const special: Record<string, Cell & { span?: number }> = {
    "0-0": { kind: "heading", span: 2 },
    "0-5": { kind: "action" },
    "1-3": { kind: "fact", ...FACTS[0] },
    "2-1": { kind: "fact", ...FACTS[1] },
    "3-4": { kind: "fact", ...FACTS[2] },
  };
  const cells: (Cell & { span?: number; r: number; c: number })[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++) {
      if (r === 0 && c === 1) continue; // covered by the heading
      cells.push({ ...(special[`${r}-${c}`] ?? { kind: "photo" }), r, c });
    }
  return cells;
}

/** Phone board: 3 × 6, four colour tiles, heading spans two cells of the top row. */
function phoneCells() {
  const special: Record<string, Cell & { span?: number }> = {
    "0-0": { kind: "heading", span: 2 },
    "2-1": { kind: "fact", ...FACTS[0] },
    "4-0": { kind: "fact", ...FACTS[1] },
    "5-2": { kind: "action" },
  };
  const cells: (Cell & { span?: number; r: number; c: number })[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 3; c++) {
      if (r === 0 && c === 1) continue;
      cells.push({ ...(special[`${r}-${c}`] ?? { kind: "photo" }), r, c });
    }
  return cells;
}

/**
 * One photograph of a car taken apart on a lift, cut across a board of square tiles.
 * The facts of a full revision sit in the gaps where the picture is swapped for colour.
 */
export function Showcase() {
  return (
    <section className="page-x mt-[clamp(120px,14vw,200px)]" aria-labelledby="showcase-title">
      <div className="shutter">
        <div className="shutter-in">
          <Grid cells={desktopCells()} cols={6} rows={4} className="hidden md:grid" headingClass="t-lead" factClass="t-body" />
          <Grid cells={phoneCells()} cols={3} rows={6} className="grid md:hidden" headingClass="t-lead" factClass="t-small" />
        </div>
      </div>
      <p className="sr-only">The photograph shows a front brake disc and caliper on a car with its wheel removed.</p>
    </section>
  );
}

function Grid({
  cells,
  cols,
  rows,
  className,
  headingClass,
  factClass,
}: {
  cells: (Cell & { span?: number; r: number; c: number })[];
  cols: number;
  rows: number;
  className: string;
  headingClass: string;
  factClass: string;
}) {
  return (
    <div className={`${className} gap-1.5 md:gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {cells.map((cell) => {
        const span = cell.span ?? 1;
        const style: React.CSSProperties = {
          gridColumn: `span ${span}`,
          aspectRatio: `${span} / 1`,
        };
        if (cell.kind === "photo") {
          return (
            <div key={`${cell.r}-${cell.c}`} className="group relative overflow-hidden rounded-tile bg-surface-2" style={style}>
              <div
                className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                style={{
                  backgroundImage: `url(${IMG})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${(cell.c / (cols - 1)) * 100}% ${(cell.r / (rows - 1)) * 100}%`,
                  filter: "saturate(0.72) contrast(1.04)",
                }}
                role="presentation"
              />
            </div>
          );
        }
        if (cell.kind === "heading") {
          return (
            <div key="h" className="rounded-tile bg-crimson p-4 text-white" style={style}>
              <h2 id="showcase-title" className={`font-[family-name:var(--ff-head)] font-light tracking-[-0.022em] ${headingClass}`}>
                Forty points, printed
              </h2>
            </div>
          );
        }
        if (cell.kind === "fact") {
          return (
            <div key={`${cell.r}-${cell.c}`} className={`rounded-tile p-4 ${cell.tone} ${factClass}`} style={style}>
              {cell.text}
            </div>
          );
        }
        return (
          <Link
            key="a"
            href={{ pathname: "/book", query: { s: "full" } }}
            className="group flex flex-col justify-between rounded-tile bg-crimson p-4 text-white transition-[background-color,transform] duration-200 hover:bg-crimson-strong active:scale-[0.98]"
            style={style}
          >
            <span className={`${factClass}`}>Book a full revision, $189</span>
            <ArrowRight className="size-6 self-end transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.6} aria-hidden />
          </Link>
        );
      })}
    </div>
  );
}
