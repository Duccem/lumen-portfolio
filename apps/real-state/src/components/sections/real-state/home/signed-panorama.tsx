import Image from "next/image";

/** A large heading that captions a full-bleed panorama arriving with the scroll. */
export function SignedPanorama() {
  return (
    <section className="mt-[clamp(120px,18vh,220px)] flex min-h-svh flex-col overflow-hidden" aria-labelledby="signed-title">
      <div className="page-x">
        <h2 id="signed-title" data-reveal className="t-display max-md:!text-[12vw]">
          Every house here
          <br />
          has an author
        </h2>
        <div className="mt-7 grid max-w-[620px] gap-4 t-small text-soft md:flex md:gap-12">
          <p data-reveal className="md:w-[220px]" style={{ ["--i" as string]: 1 }}>
            We list a house only when its architect is named and the drawings are in our hands.
          </p>
          <p data-reveal className="md:w-[220px]" style={{ ["--i" as string]: 2 }}>
            Each one is visited twice: once with the plans, once at dusk, before it reaches this page.
          </p>
        </div>
      </div>

      <div className="photo drift relative mt-10 aspect-[4/5] w-full md:aspect-[21/9]">
        <Image
          src="/images/homes/dune-villa.jpg"
          alt="White villa with a pool and palm garden above Cala Morell, Menorca"
          fill
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
      </div>
    </section>
  );
}
