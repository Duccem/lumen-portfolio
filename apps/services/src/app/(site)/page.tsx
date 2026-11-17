import { Footer } from "@/components/sections/workshop/footer";
import { ActionRow } from "@/components/sections/workshop/home/action-row";
import { Board } from "@/components/sections/workshop/home/board";
import { Figures } from "@/components/sections/workshop/home/figures";
import { Hero } from "@/components/sections/workshop/home/hero";
import { PriceList } from "@/components/sections/workshop/home/price-list";
import { Questions } from "@/components/sections/workshop/home/questions";
import { Showcase } from "@/components/sections/workshop/home/showcase";
import { VisitFlow } from "@/components/sections/workshop/home/visit-flow";
import { Navigation } from "@/components/sections/workshop/navigation";

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Board />
        <VisitFlow />
        <PriceList />
        <Showcase />
        <Figures />
        <Questions />
        <ActionRow />
      </main>
      <Footer />
    </>
  );
}
