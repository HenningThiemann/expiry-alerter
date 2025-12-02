import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { initializeApp } from "@/lib/init";
import "./globals.css";

// Initialize cron jobs on app start
if (typeof window === "undefined") {
  initializeApp();
}

export const metadata: Metadata = {
  title: "Expiry Alerter",
  description: "Track and manage secret and license expiry dates",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
