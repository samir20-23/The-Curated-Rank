"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { Item } from "@/lib/types"

interface MovieData {
  Title?: string
  Poster?: string
  Plot?: string
  Director?: string
  Actors?: string
  Genre?: string
  imdbRating?: string
  Year?: string
}

interface TMDBData {
  poster_path?: string
  overview?: string
  release_date?: string
  vote_average?: number
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  
  const { categories } = useFirebaseCategories()
  const [item, setItem] = useState<Item | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [omdbData, setOmdbData] = useState<MovieData | null>(null)
  const [tmdbData, setTmdbData] = useState<TMDBData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch item from Firestore
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const itemDoc = await getDoc(doc(db, "items", itemId))
        if (itemDoc.exists()) {
          const itemData = { id: itemDoc.id, ...itemDoc.data() } as Item
          setItem(itemData)
          
          // Find category
          const cat = categories.find(c => c.id === itemData.categoryId)
          if (cat) {
            setCategory(cat.id)
          }
        } else {
          setError("Item not found")
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (itemId) {
      fetchItem()
    }
  }, [itemId, categories])

  // Fetch movie data from APIs
  useEffect(() => {
    if (!item) return

    const fetchMovieData = async () => {
      try {
        const movie = item.title

        // Fetch from OMDb API
        const apiKey = "abe70c9a"
        const omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movie)}&type=movie`
        const omdbResponse = await fetch(omdbUrl)
        const omdbResult = await omdbResponse.json()
        
        if (omdbResult.Response === "True") {
          setOmdbData(omdbResult)
        }

        // Fetch from TMDB API
        const tmdbKey = "396b645cee00ee57c862ac3ec40a58f2"
        const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie)}&language=en-US`
        const tmdbSearchResponse = await fetch(tmdbSearchUrl)
        const tmdbSearchResult = await tmdbSearchResponse.json()
        
        if (tmdbSearchResult.results && tmdbSearchResult.results.length > 0) {
          const movieId = tmdbSearchResult.results[0].id
          const tmdbDetailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&language=en-US`
          const tmdbDetailResponse = await fetch(tmdbDetailUrl)
          const tmdbDetailResult = await tmdbDetailResponse.json()
          setTmdbData(tmdbDetailResult)
        }
      } catch (err) {
        console.error("Error fetching movie data:", err)
      }
    }

    fetchMovieData()
  }, [item])

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading item details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">{error || "Item not found"}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg font-medium transition duration-300"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const categoryData = categories.find(c => c.id === item.categoryId)
  const poster = omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : (tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : item.imageUrl)
  const plot = omdbData?.Plot || tmdbData?.overview || item.description
  const director = omdbData?.Director || "N/A"
  const actors = omdbData?.Actors || "N/A"
  const genre = omdbData?.Genre || "N/A"
  const rating = omdbData?.imdbRating || (tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : "N/A")
  const year = omdbData?.Year || (tmdbData?.release_date ? tmdbData.release_date.split("-")[0] : "N/A")

  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
      <Navigation />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="space-y-8">
          <button
            onClick={() => router.back()}
            className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors mb-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="glass-strong rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Poster */}
              <div>
                {poster ? (
                  <img
                    src={poster}
                    alt={item.title}
                    className="w-full rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center rounded-xl">
                    <span className="text-6xl">📌</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{item.title}</h1>
                  {categoryData && (
                    <p className="text-foreground/60 text-lg">
                      Category: {categoryData.name}
                      {item.type && ` • Type: ${item.type}`}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <span className="px-3 py-1 glass rounded-lg text-sm font-medium">
                      Rank: #{item.rank}
                    </span>
                    {rating !== "N/A" && (
                      <span className="px-3 py-1 glass rounded-lg text-sm font-medium">
                        Rating: {rating}
                      </span>
                    )}
                    {year !== "N/A" && (
                      <span className="px-3 py-1 glass rounded-lg text-sm font-medium">
                        Year: {year}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Plot</h2>
                  <p className="text-foreground/80 leading-relaxed">{plot}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/60 mb-1">Director</h3>
                    <p className="text-foreground">{director}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground/60 mb-1">Actors</h3>
                    <p className="text-foreground">{actors}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground/60 mb-1">Genre</h3>
                    <p className="text-foreground">{genre}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

