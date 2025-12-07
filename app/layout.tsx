import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manas Kumar Thakur - Portfolio",
  description: "AI Engineer and Backend Developer based in New Delhi, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
