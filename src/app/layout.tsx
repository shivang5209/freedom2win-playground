import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freedom2Win Playground Prototype",
  description:
    "A playable Flutter learning prototype with an animated portal and Widget Island interaction world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
