const QUESTIONS = [
  {
    q: "How long does a revision take?",
    a: "A basic revision takes about an hour, a full revision about three. Your tag shows the stage the car is at, so you can wait or come back when it says ready.",
  },
  {
    q: "What is the key tag number?",
    a: "When you book, you get a number like B7-2048. The same number goes on the tag that holds your keys on our board. Type it on this site to see where the car is.",
  },
  {
    q: "Will you do work I didn't ask for?",
    a: "No. If the inspection finds something else, it goes on the quote with its price and stays there until you approve or decline it.",
  },
  {
    q: "Can I wait while you work?",
    a: "For a basic revision, tyres or a diagnosis, yes: there is coffee and Wi-Fi at the desk. For longer jobs we can drop you at the station on Foundry Lane.",
  },
  {
    q: "Do you fit original parts?",
    a: "We fit original or equivalent-quality parts, and the quote says which. If you prefer original parts only, write it in the booking notes.",
  },
  {
    q: "Can I bring my own parts?",
    a: "Yes, for most jobs. The labour warranty still applies; the parts warranty stays with whoever sold them to you.",
  },
  {
    q: "How do I pay?",
    a: "At the desk when you collect, by card or cash. Nothing is charged online, and parts reserved on this site are paid for at the counter.",
  },
  {
    q: "What if I need to change my booking?",
    a: "Call the desk or rebook online and quote your tag number. There is no fee for changing or cancelling.",
  },
];

/** Filled tiles that open one at a time; the heading stays put while they scroll past. */
export function Questions() {
  return (
    <section id="questions" className="page-x mt-[clamp(120px,14vw,200px)] scroll-mt-20" aria-labelledby="questions-title">
      <div className="grid gap-6 md:grid-cols-12 md:gap-2">
        <div className="md:col-span-4">
          <h2 id="questions-title" data-reveal className="t-head md:sticky md:top-24">
            Before you book
          </h2>
        </div>
        <div className="space-y-1.5 md:col-span-8 md:space-y-2">
          {QUESTIONS.map((item, i) => (
            <details
              key={item.q}
              name="faq"
              data-reveal
              style={{ ["--i" as string]: i }}
              className="group rounded-tile bg-surface transition-colors duration-300 open:bg-crimson open:text-white"
            >
              <summary className="flex min-h-16 items-center justify-between gap-6 px-5 py-4 transition-colors duration-200 md:min-h-[72px] md:px-6 rounded-tile hover:bg-surface-2 group-open:hover:bg-crimson-strong">
                <span className="t-body font-medium leading-snug">{item.q}</span>
                <span className="plus" aria-hidden />
              </summary>
              <p className="max-w-[52ch] px-5 pb-6 t-body md:px-6">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
