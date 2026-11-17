import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { Property } from "@/lib/data/properties";

type Slot = { house: Property; photo: number; desk: string; ratio: string; phone: string };

/**
 * Rooms from the season, hung like prints with empty wall between them.
 * Offsets use only two values (30vh and 24vh) and every edge sits on a column line.
 */
export function InteriorsGallery({ houses }: { houses: Property[] }) {
  const pick = (slug: string) => houses.find((h) => h.slug === slug) ?? houses[0]!;
  const slots: Slot[] = [
    { house: pick("aster-house"), photo: 1, desk: "md:col-span-4 md:col-start-1", ratio: "aspect-[3/4]", phone: "w-[70%]" },
    { house: pick("salt-terrace"), photo: 1, desk: "md:col-span-6 md:col-start-7 md:mt-[30vh]", ratio: "aspect-[5/4]", phone: "ml-auto w-[84%]" },
    { house: pick("casa-calma"), photo: 2, desk: "md:col-span-6 md:col-start-6 md:mt-[24vh]", ratio: "aspect-[3/2]", phone: "w-[56%]" },
    { house: pick("elm-pavilion"), photo: 3, desk: "md:col-span-3 md:col-start-2 md:mt-[24vh]", ratio: "aspect-[4/5]", phone: "-mx-5 w-[calc(100%+40px)]" },
    { house: pick("dune-villa"), photo: 2, desk: "md:col-span-6 md:col-start-1 md:mt-[24vh]", ratio: "aspect-[5/4]", phone: "w-[70%]" },
    { house: pick("cove-villa"), photo: 4, desk: "md:col-span-4 md:col-start-9 md:mt-[30vh]", ratio: "aspect-[3/4]", phone: "ml-auto w-[84%]" },
  ];

  return (
    <section className="page-x" aria-label="Rooms from this season">
      <div className="flex flex-col gap-16 md:grid md:grid-cols-12 md:gap-x-[var(--gap)] md:gap-y-0">
        {slots.map(({ house, photo, desk, ratio, phone }, i) => {
          const p = house.photos[photo] ?? house.cover;
          return (
            <figure key={`${house.slug}-${i}`} className={`${phone} md:w-auto md:ml-0 md:mx-0 ${desk}`}>
              <Link href={`/properties/${house.slug}` as Route} className="group block">
                <div className={`shutter photo zoom relative ${ratio}`}>
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width:768px) 50vw, 90vw" className="object-cover" />
                </div>
                <figcaption className={`t-small mt-2.5 text-soft transition-colors duration-200 group-hover:text-ink ${i === 3 ? "max-md:px-5" : ""}`}>
                  {p.caption}, {house.name}
                </figcaption>
              </Link>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
