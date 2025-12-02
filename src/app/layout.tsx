import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expiry Alerter",
  description: "Track and manage secret and license expiry dates",
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
