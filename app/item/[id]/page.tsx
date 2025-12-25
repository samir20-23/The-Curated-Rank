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
  videos?: {
    results?: Array<{
      key: string
      type: string
      site: string
    }>
  }
  images?: {
    backdrops?: Array<{
      file_path: string
    }>
  }
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
  const [trailer, setTrailer] = useState<string | null>(null)
  const [backdrops, setBackdrops] = useState<string[]>([])
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
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

  // Fetch movie data from APIs - only if single exact match
  useEffect(() => {
    if (!item) return

    const fetchMovieData = async () => {
      try {
        const movie = item.title.trim()
        if (!movie) return

        const tmdbKey = "396b645cee00ee57c862ac3ec40a58f2"

        // Search TMDB first to check for exact match
        const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movie)}&language=en-US`
        const tmdbSearchResponse = await fetch(tmdbSearchUrl)
        
        if (!tmdbSearchResponse.ok) {
          console.error("TMDB search failed:", tmdbSearchResponse.status)
          return
        }

        const tmdbSearchResult = await tmdbSearchResponse.json()
        
        // Only use API if there's exactly one result that matches the title exactly
        if (tmdbSearchResult.results && tmdbSearchResult.results.length === 1) {
          const searchResult = tmdbSearchResult.results[0]
          const searchTitle = searchResult.title?.toLowerCase().trim()
          const itemTitle = movie.toLowerCase().trim()
          
          // Check if titles match exactly (100% match)
          if (searchTitle === itemTitle) {
            const movieId = searchResult.id
            
            // Get movie details with videos and images
            const tmdbDetailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&append_to_response=videos,images&language=en-US&include_image_language=en,null`
            const tmdbDetailResponse = await fetch(tmdbDetailUrl)
            
            if (!tmdbDetailResponse.ok) {
              console.error("TMDB detail fetch failed:", tmdbDetailResponse.status)
              return
            }

            const tmdbDetailResult = await tmdbDetailResponse.json()
            setTmdbData(tmdbDetailResult)

            // Extract trailer
            const trailerVideo = tmdbDetailResult.videos?.results?.find(
              (v: any) => v.type === "Trailer" && v.site === "YouTube"
            )
            if (trailerVideo) {
              setTrailer(trailerVideo.key)
            }

            // Extract backdrops
            if (tmdbDetailResult.images?.backdrops && Array.isArray(tmdbDetailResult.images.backdrops)) {
              const backdropUrls = tmdbDetailResult.images.backdrops
                .slice(0, 10)
                .map((img: any) => `https://image.tmdb.org/t/p/w500${img.file_path}`)
                .filter((url: string) => url) // Filter out any invalid URLs
              setBackdrops(backdropUrls)
            }

            // Fetch similar movies
            try {
              const similarUrl = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${tmdbKey}&language=en-US&page=1`
              const similarResponse = await fetch(similarUrl)
              if (similarResponse.ok) {
                const similarData = await similarResponse.json()
                if (similarData.results && Array.isArray(similarData.results)) {
                  setSimilarMovies(similarData.results.slice(0, 20))
                }
              }
            } catch (err) {
              console.error("Error fetching similar movies:", err)
            }

            // Also try OMDb API
            try {
              const apiKey = "abe70c9a"
              const omdbUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(movie)}&type=movie`
              const omdbResponse = await fetch(omdbUrl)
              
              if (omdbResponse.ok) {
                const omdbResult = await omdbResponse.json()
                if (omdbResult.Response === "True") {
                  setOmdbData(omdbResult)
                }
              }
            } catch (omdbErr) {
              console.error("OMDb API error:", omdbErr)
              // Continue without OMDb data
            }
          }
        }
      } catch (err) {
        console.error("Error fetching movie data:", err)
        // Silently fail - use database data only
      }
    }

    fetchMovieData()
  }, [item])

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
        <Navigation />
        <main className="container mx-auto px-4  " style={{paddingTop: "15px"}}>
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
        <main className="container mx-auto px-4  " style={{paddingTop: "15px"}}>
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
  
  // Use existing image from database if available, otherwise use API
  const poster = item.imageUrl || (omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : (tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null))
  
  // Use existing description from database if available, otherwise use API
  const plot = item.description || omdbData?.Plot || tmdbData?.overview || "No description available"
  
  // Always use item title from database (never replace)
  const displayTitle = item.title
  
  // API data for additional info (only if we have API data)
  const director = omdbData?.Director || "N/A"
  const actors = omdbData?.Actors || "N/A"
  const genre = omdbData?.Genre || "N/A"
  const rating = omdbData?.imdbRating || (tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : "N/A")
  const year = omdbData?.Year || (tmdbData?.release_date ? tmdbData.release_date.split("-")[0] : "N/A")

  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
      <Navigation />
      <main className="container mx-auto px-4 ">
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
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{displayTitle}</h1>
                  {categoryData && (
                    <p className="text-foreground/60 text-lg">
                      Category: {categoryData.name}
                      {item.type && ` • Type: ${item.type}`}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4 flex-wrap">
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

                {/* Trailer */}
                {trailer && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Trailer</h2>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="Movie Trailer"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {director !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground/60 mb-1">Director</h3>
                      <p className="text-foreground">{director}</p>
                    </div>
                  )}
                  {actors !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground/60 mb-1">Actors</h3>
                      <p className="text-foreground">{actors}</p>
                    </div>
                  )}
                  {genre !== "N/A" && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground/60 mb-1">Genre</h3>
                      <p className="text-foreground">{genre}</p>
                    </div>
                  )}
                </div>

                {/* Backdrops Gallery */}
                {backdrops.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {backdrops.map((backdrop, index) => (
                        <img
                          key={index}
                          src={backdrop}
                          alt={`Backdrop ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(backdrop, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Movies Section with Infinite Scroll */}
          {similarMovies.length > 0 && item.title && (
            <div className="mt-12 space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Movies like "{item.title}"
              </h2>
              <div className="relative overflow-hidden py-4">
                <div className="flex gap-4 animate-scroll-left" style={{ width: "max-content" }}>
                  {[...similarMovies, ...similarMovies].map((movie, index) => (
                    <div
                      key={`${movie.id}-${index}`}
                      className="flex-shrink-0 w-48 glass-strong rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="relative">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-72 object-cover"
                          />
                        ) : (
                          <div className="w-full h-72 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <span className="text-4xl">🎬</span>
                          </div>
                        )}
                        {item.title && (
                          <a
                            href={`https://moviebox.ph/web/searchResult?keyword=${encodeURIComponent(movie.title || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-2 left-2 right-2 px-3 py-2 bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary transition-colors text-center"
                          >
                            Watch
                          </a>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-foreground text-sm line-clamp-2">{movie.title}</h3>
                        {movie.release_date && (
                          <p className="text-foreground/60 text-xs mt-1">{movie.release_date.split("-")[0]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

