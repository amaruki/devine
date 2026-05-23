import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devine",
  description: "A daily.dev reading habit pet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
