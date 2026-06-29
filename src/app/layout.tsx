import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promptly - AI Powered Resume Builder",
  description: "Instantly turn unstructured text into a beautifully formatted, single-page resume.",
  keywords: ["resume builder", "AI resume", "ATS friendly resume", "CV parser", "career tools"],
  authors: [{ name: "Somesh Dayama" }],
  openGraph: {
    title: "Promptly - AI Powered Resume Builder",
    description: "Instantly turn unstructured text into a beautifully formatted, single-page resume.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promptly - AI Powered Resume Builder",
    description: "Instantly turn unstructured text into a beautifully formatted, single-page resume.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
