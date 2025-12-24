"use client"

import Link from "next/link"

export default function AdminNavigation() {
  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            The Curated Rank
          </Link>
          <Link
            href="/"
            className="px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg transition duration-300"
          >
            Back to Site
          </Link>
        </div>
      </div>
    </nav>
  )
}
