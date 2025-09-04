import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cinzel,
  Playfair_Display,
  EB_Garamond,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navigation } from "../features/navigation";
import {
  ErrorBoundary,
  VersionLogger,
  UserDebugPanel,
} from "../shared/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Calligraphy fonts with Greek support
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chrono Lens - Modern Photo Album App",
    template: "%s | Chrono Lens",
  },
  description:
    "Chrono Lens is a modern photo album app designed to help you capture, organize, and revisit your favorite memories. Make photo management simple, beautiful, and accessible.",
  authors: [{ name: "Chrono Lens Team" }],
  creator: "Chrono Lens",
  publisher: "Chrono Lens",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
      nocache: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
        <meta
          name="bingbot"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${playfairDisplay.variable} ${ebGaramond.variable} antialiased`}
      >
        <AuthProvider>
          <ErrorBoundary>
            <VersionLogger />
            <div className="flex min-h-screen w-full bg-gray-950">
              <Navigation />
              <main className="flex-1 px-2 pt-14 sm:pt-0 w-full sm:ml-20">
                {children}
              </main>
              <UserDebugPanel />
            </div>
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
