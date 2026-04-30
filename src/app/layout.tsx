import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL) : undefined,
  title: "SkoolarPlay — Learn Anything, Playfully",
  description:
    "Nigeria's #1 gamified learning platform. Master languages, STEM, arts, and more — all for free! Join 50K+ learners on SkoolarPlay.",
  keywords: [
    "SkoolarPlay",
    "Nigeria",
    "learning",
    "gamified education",
    "Yoruba",
    "Igbo",
    "Hausa",
    "WAEC",
    "JAMB",
    "online learning",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SkoolarPlay",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
  },
  openGraph: {
    title: "SkoolarPlay — Learn Anything, Playfully",
    description: "Nigeria's #1 gamified learning platform. Master languages, STEM, arts, and more — all for free!",
    images: ["/logo.png"],
    siteName: "SkoolarPlay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkoolarPlay — Learn Anything, Playfully",
    description: "Nigeria's #1 gamified learning platform. Master languages, STEM, arts, and more — all for free!",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
