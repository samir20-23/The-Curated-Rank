import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AnimatedBackground from "@/components/animated-background"
import { AuthProvider } from "@/contexts/auth-context"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Curated Rank - Premium Content Discovery",
  description: "Discover meticulously curated lists of movies, TV shows, music, actors, and gaming content.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.className} bg-background text-foreground overflow-x-hidden`} suppressHydrationWarning>
        <AuthProvider>
          <AnimatedBackground />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
