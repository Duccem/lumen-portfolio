import { CTABanner } from "@/components/sections/store/cta-banner";
import { FeatureProducts } from "@/components/sections/store/feature-products";
import { FeaturesSection } from "@/components/sections/store/features-section";
import { Footer } from "@/components/sections/store/footer";
import { Hero } from "@/components/sections/store/hero";
import { Header } from "@/components/sections/store/navigation";
import { Newsletter } from "@/components/sections/store/newsletter";
import { Testimonials } from "@/components/sections/store/testimonials";
import { TrustBadges } from "@/components/sections/store/trust-badges";

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <FeatureProducts />
      <FeaturesSection />
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
    </main>
  );
}

