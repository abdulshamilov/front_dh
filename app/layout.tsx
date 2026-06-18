import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { Inter, Manrope } from "next/font/google";
import { StoreProvider } from "@/app/shared/redux/StoreProvider";
import { ThemeProvider } from "@/app/shared/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Header } from "@/app/components/Header";
import { BottomBar } from "@/app/components/BottomBar";
import { AuthChecker } from "@/app/components/AuthChecker";
import { ToastProvider } from "@/app/components/shared/Toast";
import { AIAssistantFAB } from "@/app/components/AIAssistantFAB";
import { Suspense } from "react";

const AA_Stetica_Bold = localFont({
  src: "../public/fonts/AA_Stetica_Bold.otf",
  variable: "--font-stetica-bold",
});

const AA_Stetica_Medium = localFont({
  src: "../public/fonts/AA_Stetica_Medium.otf",
  variable: "--font-stetica-medium",
});

const AA_Stetica_Regular = localFont({
  src: "../public/fonts/AA_Stetica_Regular.otf",
  variable: "--font-stetica-regular",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Dream House",
  description: "Dream House",
};

// viewport-fit=cover lets the page render under the iOS notch & home-indicator,
// which is required for env(safe-area-inset-*) values to be non-zero.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <StoreProvider>
        <ThemeProvider>
          <body
            suppressHydrationWarning
            className={`${AA_Stetica_Bold.variable} ${AA_Stetica_Medium.variable} ${AA_Stetica_Regular.variable} ${inter.variable} ${manrope.variable} antialiased flex flex-col min-h-dvh`}
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          >
            <ToastProvider>
              <AuthChecker />
              {/* Header uses useSearchParams (CityPicker) — must be
                  inside Suspense or static prerender of /_not-found
                  and other static pages fails (Next 15). */}
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <Suspense>
                <main
                  className="flex-1"
                  style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
                >{children}</main>
              </Suspense>
              <Footer />
              <BottomBar />
              <Suspense fallback={null}>
                <AIAssistantFAB />
              </Suspense>
            </ToastProvider>
          </body>
        </ThemeProvider>
      </StoreProvider>
    </html>
  );
}
