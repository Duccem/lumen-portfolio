import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/sections/workshop/footer";
import { Navigation } from "@/components/sections/workshop/navigation";
import { PageHead, PHOTOS } from "@/components/sections/workshop/page-head";
import { Counter } from "@/components/sections/workshop/parts/counter";

export const metadata: Metadata = {
  title: "Parts counter",
  description: "Brake pads, filters, oil, bulbs and tools. Reserve online, pay and collect at the counter.",
};

export default function PartsPage() {
  return (
    <>
      <Navigation />
      <main className="page-x pt-2">
        <PageHead
          title="Parts counter"
          line="Reserve what you need; we take it off the shelf and check it against your car. Pay and collect, usually within 25 minutes."
          photos={[PHOTOS.suspension, PHOTOS.funnel, PHOTOS.disc]}
        />
        <div className="mt-2">
          <Suspense fallback={<div className="h-[640px] rounded-tile bg-surface" />}>
            <Counter />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
