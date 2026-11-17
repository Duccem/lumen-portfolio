"use client";

import { Toaster } from "@portfolio/ui/components/sonner";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <Toaster position="bottom-center" theme="dark" toastOptions={{ style: { borderRadius: 8 } }} />
    </ThemeProvider>
  );
}
