import type { Metadata } from "next";
import { Suspense } from "react";

import { Catalog } from "@/components/sections/real-state/catalog/catalog";
import { Footer } from "@/components/sections/real-state/footer";
import { Navigation } from "@/components/sections/real-state/navigation";

export const metadata: Metadata = {
  title: "The season",
  description: "Search the season's architect-signed houses by price, region, kind and bedrooms.",
};

export default async function PropertiesPage(props: PageProps<"/properties">) {
  const sp = await props.searchParams;
  // Links into the catalogue (to rent, saved, a kind of house) start a fresh selection.
  const key = ["op", "type", "saved", "region", "max"].map((k) => String(sp[k] ?? "")).join("|");

  return (
    <>
      <Navigation />
      <main>
        <Suspense>
          <Catalog key={key} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
