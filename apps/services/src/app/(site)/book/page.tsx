import type { Metadata } from "next";
import { Suspense } from "react";

import { Booking } from "@/components/sections/workshop/book/booking";
import { Footer } from "@/components/sections/workshop/footer";
import { Navigation } from "@/components/sections/workshop/navigation";
import { PageHead, PHOTOS } from "@/components/sections/workshop/page-head";

export const metadata: Metadata = {
  title: "Book a revision",
  description: "Choose the job, the car and an hour with a free lift. You leave with a key tag number to follow the car.",
};

export default function BookPage() {
  return (
    <>
      <Navigation />
      <main className="page-x pt-2">
        <PageHead
          title="Book a revision"
          line="Choose the job, the car and an hour with a free lift. You leave with a key tag number to follow the car."
          photos={[PHOTOS.lift, PHOTOS.torque, PHOTOS.drain]}
        />
        <div className="mt-2">
          <Suspense fallback={<div className="h-[640px] rounded-tile bg-surface" />}>
            <Booking />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
