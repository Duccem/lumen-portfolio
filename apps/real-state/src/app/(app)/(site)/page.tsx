import { Footer } from "@/components/sections/real-state/footer";
import { Hero } from "@/components/sections/real-state/home/hero";
import { HouseRules } from "@/components/sections/real-state/home/house-rules";
import { InteriorsGallery } from "@/components/sections/real-state/home/interiors-gallery";
import { SeasonBand } from "@/components/sections/real-state/home/season-band";
import { SeasonTable } from "@/components/sections/real-state/home/season-table";
import { SignedPanorama } from "@/components/sections/real-state/home/signed-panorama";
import { ViewingCta } from "@/components/sections/real-state/home/viewing-cta";
import { Navigation } from "@/components/sections/real-state/navigation";
import { getProperty, SEASON } from "@/lib/data/properties";

export default function Page() {
  const band = ["elm-pavilion", "salt-terrace", "cedar-box", "casa-calma"].map((s) => getProperty(s)!);

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <SeasonBand houses={band} />
        <SignedPanorama />
        <SeasonTable houses={SEASON} />
        <HouseRules />
        <InteriorsGallery houses={SEASON} />
        <ViewingCta />
      </main>
      <Footer />
    </>
  );
}
