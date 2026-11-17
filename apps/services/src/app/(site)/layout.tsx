import { RevealRoot } from "@/components/motion/reveal-root";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <RevealRoot />
      {children}
    </>
  );
}
