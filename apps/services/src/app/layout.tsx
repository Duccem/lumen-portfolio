import type { Metadata, Viewport } from "next";
import { Stack_Sans_Headline, Stack_Sans_Text } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const display = Stack_Sans_Headline({
  variable: "--ff-head",
  subsets: ["latin"],
  weight: "300",
  display: "swap",
});

const text = Stack_Sans_Text({
  variable: "--ff-text",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bay Seven — car servicing, repairs and a parts counter",
    template: "%s · Bay Seven",
  },
  description:
    "An independent workshop with seven lifts. Book a revision online, follow your car by its key tag number, and reserve parts for the counter.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
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
