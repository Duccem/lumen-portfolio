/**
 * Stepped figure tiles: three promises the workshop holds itself to, on tiles that refuse to line up.
 * These are policies (sample figures for the workshop to confirm), not claims about customers.
 */
export function Figures() {
  return (
    <section className="page-x mt-[clamp(120px,14vw,200px)]" aria-labelledby="figures-title">
      {/* Desktop */}
      <div className="relative hidden h-[70vh] min-h-[560px] grid-cols-12 gap-2 md:grid">
        <div data-reveal className="col-span-6 flex flex-col rounded-tile bg-crimson p-7 text-white">
          <p className="t-display tnum">12 months</p>
          <p className="mt-auto max-w-[36ch] t-body">Warranty on parts and labour, on every job, written on the receipt.</p>
        </div>
        <div className="col-span-3 flex flex-col">
          <h2 id="figures-title" data-reveal className="t-lead h-[14vh] pt-1" style={{ ["--i" as string]: 1 }}>
            Held to these
          </h2>
          <div data-reveal className="flex h-[44vh] min-h-[340px] flex-col rounded-tile bg-field p-7 text-field-ink" style={{ ["--i" as string]: 2 }}>
            <p className="t-head tnum">25 min</p>
            <p className="mt-auto t-body">From check-in to a quote on your phone.</p>
          </div>
        </div>
        <div className="col-span-3 flex flex-col pt-[26vh]">
          <div data-reveal className="flex h-[34vh] min-h-[260px] flex-col rounded-tile bg-mid p-7 text-field-ink" style={{ ["--i" as string]: 3 }}>
            <p className="t-head tnum">0</p>
            <p className="mt-auto t-body">Jobs started without your yes.</p>
          </div>
        </div>
      </div>

      {/* Phone: captions sit under their figures, the colour runs on below */}
      <div className="md:hidden">
        <h2 className="t-lead mb-4">Held to these</h2>
        <div data-reveal className="flex h-[64vw] flex-col rounded-tile bg-crimson p-5 text-white">
          <p className="t-display tnum">12 months</p>
          <p className="mt-3 t-small">Warranty on parts and labour, on every job.</p>
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <div data-reveal className="flex h-[58vw] flex-col rounded-tile bg-field p-4 text-field-ink">
            <p className="t-head tnum">25 min</p>
            <p className="mt-auto t-small">Check-in to a quote on your phone.</p>
          </div>
          <div data-reveal className="mt-8 flex h-[58vw] flex-col rounded-tile bg-mid p-4 text-field-ink">
            <p className="t-head tnum">0</p>
            <p className="mt-auto t-small">Jobs started without your yes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
