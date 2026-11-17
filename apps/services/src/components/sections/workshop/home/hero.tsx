import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * One large photograph of a car opened up on a lift carries the first screen.
 * The hook sits bottom-left on a flat scrim; the action sits beside it.
 */
export function Hero() {
  return (
    <section id="top" className="page-x" aria-labelledby="hero-title">
      <div className="hero-photo tile tile-photo relative h-[calc(100svh-72px)] min-h-[560px] max-h-[980px]">
        <Image
          src="/images/car-stripped-on-lift.jpg"
          alt="A car with its bumper and wheels off, raised on a lift in a repair shop"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[50%_55%]"
        />
        {/* Flat neutral scrim so the type holds on the photograph */}
        <div className="absolute inset-0 bg-black/45" aria-hidden />

        <div className="absolute inset-x-0 bottom-0 grid gap-6 p-5 text-white md:p-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 id="hero-title" className="t-display max-w-[13ch] max-md:!text-[13vw] max-md:!leading-[0.95]">
              <span className="enter block" style={{ ["--i" as string]: 0 }}>
                Honest repairs
              </span>
              <span className="enter block" style={{ ["--i" as string]: 1 }}>
                on seven lifts
              </span>
            </h1>
            <p className="enter mt-5 max-w-[46ch] t-lead" style={{ ["--i" as string]: 3 }}>
              Servicing, brakes, tyres and diagnostics at fixed prices. Book online and follow your car by its key tag.
            </p>
          </div>

          <div className="enter flex flex-col gap-4 lg:col-span-4 lg:items-end" style={{ ["--i" as string]: 5 }}>
            <div className="flex flex-wrap gap-2 max-md:flex-col">
              <Link href="/book" className="btn group !min-h-14 !px-7">
                Book a revision
                <ArrowRight className="arrow size-4" strokeWidth={1.8} aria-hidden />
              </Link>
              <Link href="/track" className="btn btn-ink !min-h-14 !px-7">
                Track my car
              </Link>
            </div>
            <p className="t-small text-white/90 lg:text-right">
              Open Mon–Fri 07:30–18:30, Sat until 13:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
