import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AnimatedBackground from "@/components/animated-background"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"

const geist = Geist({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "MarwanRank - Premium Content Discovery",
  description: "Discover meticulously curated lists of movies, TV shows, music, actors, and gaming content.",
  generator: "MarwanRank",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize theme from localStorage on server side (default to dark)
  const themeScript = `
    (function() {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = savedTheme === null || savedTheme === "dark";
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    })();
  `

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        <meta property="og:image" content="/icon.svg" />
        <meta property="og:url" content="https://the-curated-rank.vercel.app/" />
        <meta property="og:site_name" content="MarwanRank" />
        <link rel="icon" href="//icon-light-32x32.png" type="image/svg+xml" />
      </head>
      <body className={`${geist.className} bg-background text-foreground overflow-x-hidden`} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <AnimatedBackground />
            {children}
            <Analytics />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
