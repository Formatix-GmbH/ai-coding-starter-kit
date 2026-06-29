import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "FlexCover Antragsportal",
    template: "%s · FlexCover Antragsportal",
  },
  description: "Förderanträge online ausfüllen, speichern und als PDF erhalten",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col antialiased">
        {/* Erstes fokussierbares Element: überspringt Kopfzeile/Navigation. */}
        <a href="#hauptinhalt" className="skip-link">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="hauptinhalt" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <Toaster richColors />
      </body>
    </html>
  );
}
