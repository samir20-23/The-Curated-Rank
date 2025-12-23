"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

// Import from your actual data source
const formatStat = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

export default function LandingPage() {
  // This is a client component - we'll migrate to RSC when ready
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  // Import data from mockData
  const categories = [
    { id: "movies", name: "Movies", slug: "movies", showOnHome: true, tags: ["Action", "Drama", "Thriller"] },
    { id: "tv-shows", name: "TV Shows", slug: "tv-shows", showOnHome: true, tags: ["Crime", "Drama"] },
  ]

  const lists = [
    {
      id: "list-1",
      title: "Best Prison Movies",
      categoryId: "movies",
      editorPick: true,
      stats: { views: 15000, likes: 1200, saves: 800 },
      visibility: "public",
    },
  ]

  const showCategories = useMemo(() => {
    return categories.filter((c) => c.showOnHome)
  }, [search])

  const featuredLists = useMemo(() => {
    return lists.filter((l) => l.visibility === "public").slice(0, 8)
  }, [tagFilter])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 space-y-10">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Curated by Marwan Bobssi</p>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">The Curated Rank</h1>
              <p className="text-slate-200 mt-3 max-w-2xl">
                IMDB-style lists across movies, TV, music, gaming, and talent. Read-only for the public, fully editable
                via the admin dashboard.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2 text-slate-900 font-semibold shadow-lg shadow-emerald-500/30 hover:translate-y-[-1px] transition"
            >
              Admin Dashboard
            </Link>
          </header>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <label className="text-sm text-slate-200">Search categories, lists, tags</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for 'prison', 'action', 'soundtracks'..."
                  className="mt-1 w-full rounded-lg bg-slate-900 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white"
                />
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Featured Categories</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {showCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg hover:shadow-emerald-500/20 transition"
                >
                  <div className="h-40 bg-cover bg-center bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Featured Lists</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg hover:shadow-emerald-500/20 transition"
                >
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{list.title}</h3>
                    <div className="flex gap-3 text-xs text-slate-300">
                      <span>👁 {formatStat(list.stats.views)}</span>
                      <span>👍 {formatStat(list.stats.likes)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
