// Type definitions for the app
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  coverImage: string
  tags: string[]
  showOnHome: boolean
  createdAt: string
  updatedAt: string
}

export interface ListItem {
  id: string
  listId: string
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
  createdAt: string
  updatedAt: string
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

export interface User {
  id: string
  email: string
  role: "admin" | "creator" | "viewer"
  createdAt: string
  updatedAt: string
}
