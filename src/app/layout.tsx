import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promptly - AI Powered Resume Builder",
  description: "Instantly turn unstructured text into a beautifully formatted, single-page resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
