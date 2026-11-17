"use client";

import { Toaster } from "@portfolio/ui/components/sonner";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: 0 } }} />
    </ThemeProvider>
  );
}
