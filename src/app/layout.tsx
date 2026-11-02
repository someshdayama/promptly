import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Promptly – Make your resume";
const description =
  "Paste your old resume, LinkedIn, or notes and get a clean one-page resume. Edit any line, pick a layout, and download a PDF.";

export const metadata: Metadata = {
  metadataBase: new URL("https://resumebuilder-promptly.vercel.app"),
  title,
  description,
  keywords: ["resume builder", "AI resume", "one-page resume", "resume PDF", "CV maker"],
  authors: [{ name: "Somesh Dayama" }],
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
