import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/sections/workshop/footer";
import { Navigation } from "@/components/sections/workshop/navigation";
import { PageHead, PHOTOS } from "@/components/sections/workshop/page-head";
import { Tracker } from "@/components/sections/workshop/track/job-card";

export const metadata: Metadata = {
  title: "Track my car",
  description: "Type the number on your key tag to see the stage your car is at, the mechanic's notes and your quote.",
};

export default function TrackPage() {
  return (
    <>
      <Navigation />
      <main className="page-x pt-2">
        <PageHead
          title="Track my car"
          line="Type the number on your key tag. You see the stage, the mechanic's notes and any quote waiting for you."
          photos={[PHOTOS.under, PHOTOS.caliper, PHOTOS.sockets]}
        />
        <div className="mt-2">
          <Suspense fallback={<div className="h-[560px] rounded-tile bg-surface" />}>
            <Tracker />
          </Suspense>
        </div>
        <p className="mt-6 max-w-[60ch] t-small text-soft">
          This demo runs in your browser. Tickets you book here move through the stages on their own as the drop-off
          time passes; the three sample tags are always on the board.
        </p>
      </main>
      <Footer />
    </>
  );
}
