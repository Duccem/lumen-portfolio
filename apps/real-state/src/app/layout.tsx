import type { Metadata } from "next";
import localFont from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";

const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../fonts/ClashGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ClashGrotesk-Medium.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "Lintel — architect-signed homes on the Iberian coast",
    template: "%s · Lintel",
  },
  description:
    "Twelve architect-signed houses a season, from Sintra to the Costa Brava. Visited, measured and photographed before they are listed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clash.variable} suppressHydrationWarning>
      <head>
        {/* Hidden starting states for motion only apply once this class exists. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
