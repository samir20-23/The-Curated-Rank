export interface Category {
  id: string
  name: string
  slug: string
  description: string
  coverImage: string
  tags: string[]
  showOnHome: boolean
}

export interface ListItem {
  id: string
  title: string
  year?: number
  runtime?: string
  director?: string
  cast?: string[]
  description: string
  coverImage: string
  images?: string[]
  externalLinks?: { name: string; url: string }[]
  imdbRating?: number
  imdbStarsText?: string
  tags?: string[]
  position: number
}

export interface List {
  id: string
  categoryId: string
  title: string
  description: string
  coverImage: string
  tags: string[]
  visibility: "public" | "private"
  owner: string
  items: ListItem[]
  stats: {
    views: number
    likes: number
    saves: number
  }
  editorPick: boolean
  createdAt: string
  updatedAt: string
}

export const categories: Category[] = [
  {
    id: "movies",
    name: "Movies",
    slug: "movies",
    description: "Curated lists of the best movies across all genres",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=400&fit=crop",
    tags: ["Action", "Drama", "Thriller", "Comedy", "Romance"],
    showOnHome: true,
  },
  {
    id: "tv-shows",
    name: "TV Shows",
    slug: "tv-shows",
    description: "Best television series and limited series",
    coverImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=400&fit=crop",
    tags: ["Drama", "Crime", "Sci-Fi", "Comedy", "Horror"],
    showOnHome: true,
  },
  {
    id: "actors-directors",
    name: "Actors & Directors",
    slug: "actors-directors",
    description: "Legendary performers and filmmakers",
    coverImage: "https://images.unsplash.com/photo-1489599849228-ed4dc5ee4b2b?w=800&h=400&fit=crop",
    tags: ["Leonardo DiCaprio", "Christopher Nolan", "Denzel Washington"],
    showOnHome: true,
  },
  {
    id: "music",
    name: "Music",
    slug: "music",
    description: "Curated lists of albums, artists, and soundtracks",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    tags: ["Rock", "Hip-Hop", "Pop", "Jazz", "Indie"],
    showOnHome: true,
  },
  {
    id: "gaming",
    name: "Gaming",
    slug: "gaming",
    description: "Best video games and gaming experiences",
    coverImage: "https://images.unsplash.com/photo-1538481143235-5d630fdfa5ec?w=800&h=400&fit=crop",
    tags: ["RPG", "FPS", "Adventure", "Indie", "Multiplayer"],
    showOnHome: true,
  },
]

export const lists: List[] = [
  {
    id: "list-1",
    categoryId: "movies",
    title: "Best Prison Movies",
    description: "Greatest films about life behind bars, escapes, and redemption",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop",
    tags: ["Prison", "Drama", "Thriller"],
    visibility: "public",
    owner: "Marwan Bobssi",
    editorPick: true,
    items: [
      {
        id: "item-1",
        title: "The Shawshank Redemption",
        year: 1994,
        runtime: "142 min",
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman"],
        description:
          "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
        imdbRating: 9.3,
        imdbStarsText: "3.1M",
        position: 1,
        tags: ["Prison", "Drama", "Redemption"],
      },
      {
        id: "item-2",
        title: "Escape Plan",
        year: 2013,
        runtime: "115 min",
        director: "Mikael Håfström",
        cast: ["Sylvester Stallone", "Arnold Schwarzenegger"],
        description:
          "A security expert is framed and imprisoned in a high-tech penitentiary and must use his skills to escape.",
        coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
        imdbRating: 6.5,
        imdbStarsText: "0.5M",
        position: 2,
        tags: ["Action", "Prison", "Thriller"],
      },
    ],
    stats: { views: 15000, likes: 1200, saves: 800 },
    createdAt: "2024-01-15",
    updatedAt: "2024-12-20",
  },
  {
    id: "list-2",
    categoryId: "tv-shows",
    title: "Best Crime Drama Series",
    description: "Intense crime and law enforcement television series",
    coverImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=300&fit=crop",
    tags: ["Crime", "Drama", "Thriller"],
    visibility: "public",
    owner: "Marwan Bobssi",
    editorPick: true,
    items: [
      {
        id: "item-3",
        title: "Breaking Bad",
        year: 2008,
        runtime: "47 min",
        director: "Vince Gilligan",
        cast: ["Bryan Cranston", "Aaron Paul"],
        description: "A high school chemistry teacher diagnoses cancer and cooks methamphetamine to fund his family.",
        coverImage: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=450&fit=crop",
        imdbRating: 9.5,
        imdbStarsText: "2.5M",
        position: 1,
        tags: ["Crime", "Drama", "Thriller"],
      },
    ],
    stats: { views: 25000, likes: 2000, saves: 1500 },
    createdAt: "2024-01-20",
    updatedAt: "2024-12-20",
  },
]
