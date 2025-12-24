"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const { user, logout, isAdmin } = useAuth()

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove("dark")
    } else {
      html.classList.add("dark")
    }
    setIsDark(!isDark)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          The Curated Rank
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
            Browse
          </Link>
          {isAdmin && user && (
            <Link href="/admin" className="text-foreground/80 hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.707a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2 2a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm1.707 4.293a1 1 0 011.414-1.414l.707.707a1 1 0 11-1.414 1.414l-.707-.707zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm4.293-1.707a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zm2-2a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1.707-4.293a1 1 0 011.414-1.414l.707.707a1 1 0 11-1.414 1.414l-.707-.707zM5.707 5.707a1 1 0 010 1.414L5 7.829a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zm-2 2a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm-1.707 4.293a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM5.707 14.293a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 glass text-foreground hover:bg-secondary/50 rounded-lg font-medium transition duration-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 glass text-foreground hover:bg-secondary/50 rounded-lg font-medium transition duration-300"
            >
              Login
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 glass border-b md:hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
                Browse
              </Link>
              {isAdmin && user && (
                <Link href="/admin" className="text-foreground/80 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
              <button
                onClick={toggleDarkMode}
                className="text-left text-foreground/80 hover:text-primary transition-colors"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-left text-foreground/80 hover:text-primary transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link href="/login" className="text-foreground/80 hover:text-primary transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
