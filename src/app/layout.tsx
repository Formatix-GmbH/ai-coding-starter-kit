import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

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
      <body className="antialiased">
        <SiteHeader />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
