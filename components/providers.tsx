"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  }));

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#059669",
          colorBackground: "#ffffff",
          colorText: "#0A0F1E",
          colorTextSecondary: "#6b7280",
          colorInputBackground: "#f9fafb",
          colorInputText: "#0A0F1E",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
        elements: {
          card: "shadow-2xl shadow-black/10 border border-border",
          headerTitle: "font-bold text-2xl tracking-tight",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all duration-200",
          socialButtonsBlockButton: "border border-border hover:bg-muted rounded-xl transition-all",
          dividerLine: "bg-border",
          formFieldInput: "border-input bg-background rounded-lg",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: "var(--font-geist-sans)" },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
