"use client"

export default function Hero() {
  return (
    <section className="relative py-12 md:py-20 overflow-hidden   from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover & Explore
          </h1>
          <p className="text-white/70 mb-6 text-lg md:text-xl">
            Welcome to <span className="font-semibold">MarwanRank</span> — curated top lists of movies, shows, and content just for you.
            Browse, explore, and find your favorites easily.
          </p>
          <p className="text-white/50 text-sm md:text-base">
            Scroll down to see the top rankings, newest collections, and curated content from various categories.
          </p>
        </div>
      </div>
      <div className="absolute inset-0  from-gray-900 to-transparent pointer-events-none" />
    </section>
  )
}
