"use client"

interface CategoryCardProps {
  id: string
  title: string
  type: string
  imageUrl?: string
  onClick: () => void
}

export default function CategoryCard({ id, title, type, imageUrl, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative p-6 glass-strong rounded-xl hover-lift overflow-hidden text-left h-64"
    >
      {/* Background image with opacity */}
      {imageUrl && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-60" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <p className="text-foreground/70 text-sm mt-1">{type}</p>
        </div>

        <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
          <span className="text-sm font-medium">View Items</span>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
