import Image from "next/image";

type Photo = { src: string; alt: string; label: string };

const STRIPS = ["bg-crimson text-white", "bg-field text-field-ink", "bg-mid text-field-ink"];

/**
 * The first row of every inner page is a row of the board: the page's name at display size
 * in its own tile, the workshop footage, and three photographs of the trade with their strips.
 */
export function PageHead({ title, line, photos }: { title: string; line: string; photos: [Photo, Photo, Photo] }) {
  return (
    <header className="grid grid-cols-2 gap-1.5 md:grid-cols-12 md:gap-2">
      <div className="frame-in col-span-2 flex min-h-[220px] flex-col justify-between gap-6 rounded-tile bg-surface p-5 md:col-span-5 md:min-h-[340px] md:p-7">
        <h1 className="t-display max-w-[9ch]">{title}</h1>
        <p className="max-w-[40ch] t-body">{line}</p>
      </div>

      <figure className="frame-in tile tile-photo relative col-span-2 aspect-video md:col-span-3 md:aspect-auto" style={{ ["--i" as string]: 1 }}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/workshop-loop-poster.jpg"
          aria-label="Footage from a car workshop: a car on a lift, a mechanic at the wheel, a wall of parts"
        >
          <source src="/video/workshop-loop.webm" type="video/webm" />
          <source src="/video/workshop-loop.mp4" type="video/mp4" />
        </video>
      </figure>

      <Frame photo={photos[0]} strip={STRIPS[0]} i={2} className="col-span-1 aspect-[3/4] md:col-span-2 md:aspect-auto" />
      <div className="col-span-1 grid gap-1.5 md:col-span-2 md:gap-2">
        <Frame photo={photos[1]} strip={STRIPS[1]} i={3} className="aspect-[4/3] md:aspect-auto" />
        <Frame photo={photos[2]} strip={STRIPS[2]} i={4} className="aspect-[4/3] md:aspect-auto" />
      </div>
    </header>
  );
}

function Frame({ photo, strip, i, className }: { photo: Photo; strip: string; i: number; className: string }) {
  return (
    <figure className={`frame-in flex flex-col overflow-hidden rounded-tile ${className}`} style={{ ["--i" as string]: i }}>
      <div className="tile-photo relative min-h-0 flex-1">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 17vw, 50vw" className="object-cover" preload />
      </div>
      <figcaption className={`flex h-7 shrink-0 items-center truncate px-3 text-[14px] leading-none ${strip}`}>{photo.label}</figcaption>
    </figure>
  );
}

export const PHOTOS = {
  lift: { src: "/images/car-on-lift.jpg", alt: "A hatchback raised on a blue two-post lift", label: "Two-post lift" },
  under: { src: "/images/mechanic-under-lift.jpg", alt: "A mechanic standing under a car on a lift", label: "Under the car" },
  torque: { src: "/images/torque-wrench.jpg", alt: "The scale of a beam torque wrench read close", label: "Torque, to the number" },
  suspension: { src: "/images/suspension-work.jpg", alt: "A mechanic working on the suspension of a raised car", label: "Suspension, from below" },
  caliper: { src: "/images/brake-caliper.jpg", alt: "Hands tightening brake pipes at a wheel hub", label: "Brake lines" },
  drain: { src: "/images/oil-drain.jpg", alt: "Old oil draining from under a car into a collector", label: "Old oil out" },
  sockets: { src: "/images/socket-set.jpg", alt: "A socket set with two ratchets in a metal box", label: "Half-inch sockets" },
  disc: { src: "/images/brake-disc.jpg", alt: "A front brake disc and caliper with the wheel removed", label: "Front brake" },
  funnel: { src: "/images/oil-funnel.jpg", alt: "Engine oil poured through a yellow funnel", label: "Fresh oil" },
} satisfies Record<string, Photo>;
