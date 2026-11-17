import { RevealRoot } from "@/components/motion/reveal-root";
import { SavedProvider } from "@/components/sections/real-state/saved/saved-context";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SavedProvider>
      <RevealRoot />
      {children}
    </SavedProvider>
  );
}
