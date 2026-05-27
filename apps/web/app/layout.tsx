import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "FormYatra — Build Beautiful Forms",
  description: "A city-themed form builder with an Indian soul. Jaipur, Mumbai, Kerala, Bangalore, Goa — every page tells a story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GlobalProviders>{children}</GlobalProviders>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
