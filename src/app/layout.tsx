import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mani | Portfolio",
    description: "Portfolio of Mani, Python and Django developer.",
  icons: {
    icon: "/static/icons/icon.svg",
  },
  openGraph: {
    title: "Mani | Portfolio",
  description: "Portfolio of Mani, Python and Django developer.",
    type: "website",
    images: [
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  twitter: {
    card: "summary_large_image",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="application-name" content="Mani Portfolio" />
        <meta name="apple-mobile-web-app-title" content="Mani Portfolio" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>
      <body>
        <div id="progress-bar" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
