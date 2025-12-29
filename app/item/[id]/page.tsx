"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import OptimizedImage from "@/components/optimized-image"
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
  const itemId = (params?.id as string) || ""

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

  const plot = item?.description || omdbData?.Plot || tmdbData?.overview || " "
  const displayTitle = item?.title || " "
  const director = omdbData?.Director || "N/A"
  const actors = omdbData?.Actors || "N/A"
  const genre = omdbData?.Genre || "N/A"
  const rating = omdbData?.imdbRating || (tmdbData?.vote_average ? tmdbData.vote_average.toFixed(1) : "N/A")
  const year = omdbData?.Year || (tmdbData?.release_date ? tmdbData.release_date.split("-")[0] : "N/A")
  const isMovieCategory = !!categoryData?.name && String(categoryData.name).toLowerCase().includes("movies")
  const isTvShowCategory = !!categoryData?.name && String(categoryData.name).toLowerCase().includes("Tv Shows".toLowerCase() || "TV Shows".toLowerCase())
  const isMusicCategory = !!categoryData?.name && String(categoryData.name).toLowerCase().includes("music")


  // Watch server helpers
  const movieboxUrlFor = (title: string) => `https://moviebox.ph/web/searchResult?keyword=${encodeURIComponent(title)}`

  // Convert title to slug format (lowercase, replace spaces with hyphens)
  const titleToSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Server URL helpers
  const getServerUrls = (title: string) => {
    const slug = titleToSlug(title)
    const encoded = encodeURIComponent(title)
    const plusSeparated = title.replace(/\s+/g, '+')

    return {
      moviebox: movieboxUrlFor(title),
      moviesjoytv: `https://moviesjoytv.to/search/${slug}`,
      sflix: `https://sflix.ps/search/${slug}`,
      flixer: `https://flixer.sh/search?q=${encoded}`,
      egydead: `https://egydead.media/?s=${plusSeparated}`
    }
  }

  // Check if item has valid title/description for watch buttons
  const hasValidTitle = item?.title && item.title.trim() !== "" && displayTitle !== " "

  // small ButtonLink component to keep style consistent
  const ButtonLink = ({ href, children, leadingIcon }: { href: string, children: React.ReactNode, leadingIcon?: React.ReactNode }) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition transform shadow-sm backdrop-blur-sm bg-foreground/6 border border-white/6 hover:scale-105 hover:backdrop-brightness-110"
      >
        {leadingIcon && <span className="opacity-90">{leadingIcon}</span>}
        <span className="truncate max-w-[10rem]">{children}</span>
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(7,10,18,0.6),rgba(8,11,20,0.8))] relative">
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
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors"
                aria-label="Back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

            </div>

            <div className="glass-strong rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster */}
                <div className="md:col-span-1 flex items-start">
                  {poster ? (
                    <OptimizedImage
                      src={poster}
                      alt={displayTitle}
                      width={400}
                      height={600}
                      className="w-full rounded-xl shadow-2xl object-cover max-h-[190px] max-w-[190px] md:max-w-[200px] md:max-h-[520px]"
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center rounded-xl">
                      <span className="text-6xl">📌</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{displayTitle}</h1>
                    {categoryData && <p className="text-foreground/60 text-sm">Category: {categoryData.name}{item.type && ` • Type: ${item.type}`}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Rank: #{item.rank} in list  {item.type && ` • ${item.type}`}</span>
                    {rating !== "N/A" && <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Rating: {rating}</span>}
                    {year !== "N/A" && <span className="px-3 py-1 glass rounded-lg text-sm font-medium">Year: {year}</span>}
                  </div>

                  {/* Music buttons (only for music category) */}
                  {isMusicCategory && hasValidTitle && (() => {
                    const title = item.title!
                    const encoded = encodeURIComponent(title)
                    const plus = title.replace(/\s+/g, "+")
                    return (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <ButtonLink href={`https://soundcloud.com/search?q=${encoded}`} leadingIcon={<span>🎧</span>}>
                          SoundCloud
                        </ButtonLink>
                        <ButtonLink href={`https://open.spotify.com/search/${encoded}`} leadingIcon={<span>🎵</span>}>
                          Spotify
                        </ButtonLink>
                        <ButtonLink href={`https://www.youtube.com/results?search_query=${plus}`} leadingIcon={<span>▶️</span>}>
                          YouTube
                        </ButtonLink>
                        <ButtonLink href={`https://www.google.com/search?q=${encoded}`} leadingIcon={<span>🔎</span>}>
                          Web Search
                        </ButtonLink>
                      </div>
                    )
                  })()}

                  {(isTvShowCategory || isMovieCategory) && hasValidTitle && (() => {
                    const serverUrls = getServerUrls(item.title!)
                    return (
                      <div className=" px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition flex flex-wrap gap-3 mt-4">
                        <ButtonLink href={serverUrls.moviebox} leadingIcon={<span><OptimizedImage src="/logos/movieBox.png" alt="MovieBox" width={20} height={20} /></span>}>MovieBox</ButtonLink>
                        <ButtonLink href={serverUrls.moviesjoytv} leadingIcon={<span><OptimizedImage src="/logos/moviesJoy.png" alt="MoviesJoy" width={30} height={30} /></span>}>MoviesJoy</ButtonLink>
                        <ButtonLink href={serverUrls.sflix} leadingIcon={<span><OptimizedImage src="/logos/sFlix.png" alt="SFlix" width={30} height={30} /></span>}>SFlix</ButtonLink>
                        <ButtonLink href={serverUrls.flixer} leadingIcon={<span><OptimizedImage src="/logos/flixer.png" alt="Flixer" width={60} height={50} /></span>}> </ButtonLink>
                        <ButtonLink href={serverUrls.egydead} leadingIcon={<span><OptimizedImage src="/logos/egydead.png" alt="EgyDead" width={60} height={50} /></span>}> </ButtonLink>
                      </div>
                    )
                  })()}

                  <div className="mt-4">
                    <h2 className="text-lg font-bold text-foreground mb-2">{plot.trim() !== "" ? "Plot" : " "}</h2>
                    <p className="text-foreground/80 leading-relaxed">{plot}</p>
                  </div>

                  {/* Trailer */}
                  {trailer && (
                    <div className="mt-4">
                      <h2 className="text-lg font-bold text-foreground mb-2">Trailer</h2>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe src={`https://www.youtube.com/embed/${trailer}`} className="w-full h-full" allowFullScreen title="Trailer" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                    <OptimizedImage
                      key={i}
                      src={b}
                      alt={`Backdrop ${i + 1}`}
                      width={300}
                      height={144}
                      className="w-full md:h-36 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      onClick={() => window.open(b, "_blank")}
                    />
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
                      const title = movie.title || movie.name || " "
                      const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null
                      const overview = movie.overview || ""
                      const movieHasTitle = title && title !== " "
                      const movieUrls = movieHasTitle ? getServerUrls(title) : null

                      return (
                        <div key={`${movie.id || idx}-${idx}`} className="flex-shrink-0 w-44 sm:w-48 md:w-56 lg:w-64 glass-strong rounded-lg overflow-hidden group">
                          <div className="relative w-full" style={{ aspectRatio: "2/3" }}>

                            {posterPath ? (
                              <OptimizedImage
                                src={posterPath}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 176px, (max-width: 768px) 192px, 224px"
                              />
                            ) : (
                              <div className="w-full h-56 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                <span className="text-3xl">🎬</span>
                              </div>
                            )}
                            {movieUrls && (
                              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1">
                                <a
                                  href={movieUrls.moviebox}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition"
                                >
                                  MovieBox
                                </a>
                                <a
                                  href={movieUrls.moviesjoytv}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition"
                                >
                                  MoviesJoy
                                </a>
                                <a
                                  href={movieUrls.sflix}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition"
                                >
                                  SFlix
                                </a>
                                <a
                                  href={movieUrls.flixer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition"
                                >
                                  Flixer
                                </a>
                                <a
                                  href={movieUrls.egydead}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 glass rounded-md text-xs font-medium text-center hover:scale-105 transition"
                                >
                                  EgyDead
                                </a>
                              </div>
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

            {!similarMovies.length && (
              <div className="text-center py-8 text-foreground/60">No suggestions available</div>
            )}
          </div>
        )
        }
      </main>
      <Footer />
    </div>
  )
}
