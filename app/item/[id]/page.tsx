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
  const [categoryData, setCategoryData] = useState<any | null>(null)
  const [omdbData, setOmdbData] = useState<MovieData | null>(null)
  const [tmdbData, setTmdbData] = useState<TMDBData | null>(null)
  const [trailer, setTrailer] = useState<string | null>(null)
  const [backdrops, setBackdrops] = useState<string[]>([])
  const [similarMovies, setSimilarMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tmdbKey = "396b645cee00ee57c862ac3ec40a58f2"
  const omdbKey = "abe70c9a"

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

          const cat = categories.find(c => c.id === itemData.categoryId) || null
          setCategoryData(cat)
        } else {
          setError("Item not found")
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (itemId) fetchItem()
  }, [itemId, categories])

  // Fetch movie data + similar / fallback random list
  useEffect(() => {
    if (!item) return

    const isMovieCategory = !!categoryData?.name && String(categoryData.name).toLowerCase().includes("movie")

    const fetchMovieData = async () => {
      try {
        const rawTitle = (item.title || "").toString().trim()
        if (!rawTitle) {
          // No title -> fallback fetch popular movies to show something
          const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}&language=en-US&page=1`
          const popularRes = await fetch(popularUrl)
          if (popularRes.ok) {
            const json = await popularRes.json()
            setSimilarMovies((json.results || []).slice(0, 20))
          }
          return
        }

        // Try TMDB search
        const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(rawTitle)}&language=en-US`
        const tmdbSearchResponse = await fetch(tmdbSearchUrl)
        if (!tmdbSearchResponse.ok) {
          // fallback popular
          const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}&language=en-US&page=1`
          const popularRes = await fetch(popularUrl)
          if (popularRes.ok) {
            const json = await popularRes.json()
            setSimilarMovies((json.results || []).slice(0, 20))
          }
          return
        }

        const tmdbSearchResult = await tmdbSearchResponse.json()

        // If exact single match, fetch details + similar
        if (tmdbSearchResult.results && tmdbSearchResult.results.length === 1) {
          const searchResult = tmdbSearchResult.results[0]
          const searchTitle = (searchResult.title || "").toString().toLowerCase().trim()
          const itemTitle = rawTitle.toLowerCase()
          if (searchTitle === itemTitle) {
            const movieId = searchResult.id
            const tmdbDetailUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&append_to_response=videos,images&language=en-US&include_image_language=en,null`
            const tmdbDetailResponse = await fetch(tmdbDetailUrl)
            if (tmdbDetailResponse.ok) {
              const tmdbDetailResult = await tmdbDetailResponse.json()
              setTmdbData(tmdbDetailResult)
              // trailer
              const trailerVideo = tmdbDetailResult.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
              if (trailerVideo) setTrailer(trailerVideo.key)
              // backdrops
              if (Array.isArray(tmdbDetailResult.images?.backdrops)) {
                const urls = tmdbDetailResult.images.backdrops.slice(0, 10).map((b: any) => `https://image.tmdb.org/t/p/w500${b.file_path}`).filter(Boolean)
                setBackdrops(urls)
              }
            }

            // similar movies
            try {
              const similarUrl = `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${tmdbKey}&language=en-US&page=1`
              const similarResponse = await fetch(similarUrl)
              if (similarResponse.ok) {
                const similarJson = await similarResponse.json()
                setSimilarMovies((similarJson.results || []).slice(0, 20))
              } else {
                setSimilarMovies([])
              }
            } catch {
              setSimilarMovies([])
            }

            // OMDb try
            try {
              const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(rawTitle)}&type=movie`
              const omdbResp = await fetch(omdbUrl)
              if (omdbResp.ok) {
                const omdbJson = await omdbResp.json()
                if (omdbJson.Response === "True") setOmdbData(omdbJson)
              }
            } catch { }
            return
          }
        }

        // If search returns multiple results -> use them as similar suggestions
        if (tmdbSearchResult.results && tmdbSearchResult.results.length > 0) {
          setSimilarMovies(tmdbSearchResult.results.slice(0, 20))
          // try OMDb for best match (first result)
          try {
            const first = tmdbSearchResult.results[0]
            const maybeTitle = first.title || rawTitle
            const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${encodeURIComponent(maybeTitle)}&type=movie`
            const omdbResp = await fetch(omdbUrl)
            if (omdbResp.ok) {
              const omdbJson = await omdbResp.json()
              if (omdbJson.Response === "True") setOmdbData(omdbJson)
            }
          } catch { }
          return
        }

        // No search results -> fallback to popular/random
        const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}&language=en-US&page=1`
        const popularRes = await fetch(popularUrl)
        if (popularRes.ok) {
          const json = await popularRes.json()
          let results = (json.results || []).slice(0, 40)
          // shuffle and take 20
          results = results.sort(() => 0.5 - Math.random()).slice(0, 20)
          setSimilarMovies(results)
        }
      } catch (err) {
        console.error("Error fetching movie data:", err)
      }
    }

    fetchMovieData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, categoryData])

  // helpers
  const poster =
    item?.imageUrl ||
    (omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : (tmdbData?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null))

  const plot = item?.description || omdbData?.Plot || tmdbData?.overview || "No description available"
  const displayTitle = item?.title || item?.name || "Untitled"
  const director = omdbData?.Director || "N/A"
  const actors = omdbData?.Actors || "N/A"
  const genre = omdbData?.Genre || "N/A"
  const rating = omdbData?.imdbRating || (tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : "N/A")
  const year = omdbData?.Year || (tmdbData?.release_date ? tmdbData.release_date.split("-")[0] : "N/A")
  const isMovieCategory = !!categoryData?.name && String(categoryData.name).toLowerCase().includes("movie")

  // Watch on Moviebox helper
  const movieboxUrlFor = (title: string) => `https://moviebox.ph/web/searchResult?keyword=${encodeURIComponent(title)}`

  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Loading item details...</p>
          </div>
        ) : error || !item ? (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">{error || "Item not found"}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg font-medium transition duration-300"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <button
              onClick={() => router.back()}
              className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors mb-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="glass-strong rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster */}
                <div>
                  {poster ? (
                    <img src={poster} alt={displayTitle} className=" rounded-xl shadow-2xl object-cover" />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center rounded-xl">
                      <span className="text-6xl">📌</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{displayTitle}</h1>
                    {categoryData && (
                      <p className="text-foreground/60 text-base">
                        Category: {categoryData.name}
                        {item.type && ` • Type: ${item.type}`}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Rank: #{item.rank}</span>
                      {rating !== "N/A" && <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Rating: {rating}</span>}
                      {year !== "N/A" && <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Year: {year}</span>}
                      {/* Watch on Moviebox button only for movie categories and when title exists */}
                      {isMovieCategory && item.title && (
                        <a
                          href={movieboxUrlFor(item.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary/90 text-primary-foreground rounded-lg text-sm font-semibold hover:scale-105 transition transform"
                        >
                          Watch on MovieBox
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Plot</h2>
                    <p className="text-foreground/80 leading-relaxed">{plot}</p>
                  </div>

                  {/* Trailer */}
                  {trailer && (
                    <div>
                      <h2 className="text-lg font-bold text-foreground mb-2">Trailer</h2>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe src={`https://www.youtube.com/embed/${trailer}`} className="w-full h-full" allowFullScreen title="Trailer" />
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
                </div>
              </div>
            </div>

            {/* Backdrops */}
            {backdrops.length > 0 && (
              <div className="glass-strong rounded-xl p-4">
                <h2 className="text-lg font-bold mb-3">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {backdrops.map((b, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={b} alt={`Backdrop ${i + 1}`} className="w-full h-36 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(b, "_blank")} />
                  ))}
                </div>
              </div>
            )}

            {/* Similar / Random Movies horizontal carousel (responsive) */}
            {similarMovies.length > 0 && (
              <div className="space-y-3 mt-8">
                <h2 className="text-2xl font-bold text-foreground">You might also like</h2>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "160px" }}>
                  <div className="flex flex-wrap gap-4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {similarMovies.map((movie: any, idx: number) => {
                      const title = movie.title || movie.name || "Untitled"
                      const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null
                      const overview = movie.overview || ""
                      return (
                        <div key={`${movie.id || idx}-${idx}`} className="flex-shrink-0 w-44 sm:w-48 md:w-56 lg:w-64 glass-strong rounded-lg overflow-hidden group">
                          <div className="relative">
                            {posterPath ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={posterPath} alt={title} className="w-full h-56 object-cover" />
                            ) : (
                              <div className="w-full h-56 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                <span className="text-3xl">🎬</span>
                              </div>
                            )}
                            {isMovieCategory && (
                              <a
                                href={movieboxUrlFor(title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-3 left-3 right-3 px-2 py-1 bg-primary/90 text-primary-foreground rounded-md text-xs font-medium text-center"
                              >
                                Watch
                              </a>
                            )}
                          </div>

                          <div className="p-3">
                            <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
                            {movie.release_date && <p className="text-xs text-foreground/60 mt-1">{movie.release_date.split("-")[0]}</p>}
                            <p className="text-xs text-foreground/60 mt-2 line-clamp-3">{overview}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}


            {/* if no similar movies and item exists -> show random picks from popular as fallback */}
            {!similarMovies.length && (
              <div className="text-center py-8 text-foreground/60">No suggestions available</div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
