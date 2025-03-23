import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import ThemeDataProvider from "@/context/theme-data-provider";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samaflix - Streaming Films et Séries HD",
  description: "Regardez les meilleurs films et séries en streaming HD, sans pub et gratuitement sur Samaflix. Dernières sorties, films VF et VOSTFR en ligne.",
  manifest: "/manifest.json",
  icons: {
    icon: "/samaflix.ico",
    apple: [
      { url: "/icons/icon-192x192.png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" }
    ]
  },
  themeColor: "#1a1a1a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Samaflix"
  },
  keywords: [
    "Streaming films", "Series", "Movies", "Samaflix", "Watch online", 
    "Films en streaming", "Regarder films en ligne", "Meilleur site de streaming", 
    "Streaming gratuit", "Streaming films HD", "Streaming sans pub", 
    "Films VF et VOSTFR", "Meilleur site de films", "Où regarder des films en streaming légalement ?", 
    "Films action en streaming HD gratuit", "Meilleur site pour voir des films récents", 
    "Streaming de films sans inscription", "Voir des films 4K en ligne", "Streaming films horreur", 
    "Films de science-fiction en streaming", "Regarder films romantiques en ligne", 
    "Streaming séries et films animation", "Derniers films en streaming", "Films et séries Netflix", 
    "Films d'aventure en streaming", "Films policiers et thrillers", "Films en streaming sans abonnement",
    "Best streaming platform for movies", "Watch free movies online", "Legal movie streaming sites"
  ],
  authors: {
    name: "@M3dev4"
  },
  openGraph: {
    title: "Samaflix - Films et Séries en Streaming",
    description: "Regardez gratuitement les meilleurs films et séries en streaming HD sur Samaflix.",
    url: "https://samaflix.com",
    siteName: "Samaflix",
    images: [
      {
        url: "/samaflix-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Samaflix - Films et Séries en Streaming"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Samaflix - Films et Séries en Streaming HD",
    description: "Regardez les meilleurs films et séries en streaming HD, sans pub et gratuitement sur Samaflix.",
    images: "/samaflix-banner.jpg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Samaflix" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Samaflix" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1a1a1a" />

        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#1a1a1a" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeDataProvider>
            {children}
            <Toaster richColors position="top-center" />
          </ThemeDataProvider>
        </NextThemesProvider>

        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
