import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, Pompiere } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const pompiere = Pompiere({
  variable: "--font-pompiere",
  subsets: ["latin"],
  weight: "400",
});


export const metadata: Metadata = {
  title: "WayFlame — Your hub for the cancer journey",
  description:
    "A private hub for cancer patients and caregivers. Track symptoms, journal the journey, find clinical trials and support groups, and draft the conversations cancer asks of you.",
  openGraph: {
    title: "WayFlame — Your hub for the cancer journey",
    description:
      "A private hub for cancer patients and caregivers. Track symptoms, journal, find clinical trials and support groups, and draft the messages cancer asks of you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${pompiere.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
