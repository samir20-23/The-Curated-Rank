export interface Category {
  id: string
  name: string
  type: string // Keep for backward compatibility
  tags?: string[] // New tags array
  useTypes?: boolean // If false, show normal list without type grouping
  image: string
  imageUrl?: string
  order?: number
  createdAt?: Date
}

export interface Item {
  id: string
  categoryId: string
  title?: string // Optional
  description?: string // Optional
  type?: string // Type selected from category tags
  image: string
  imageUrl?: string
  rank: number
  createdAt?: Date
}

export interface SocialLink {
  id: string
  name: string
  url: string
  iconUrl?: string
  order?: number
  createdAt?: Date
}

export interface SocialPost {
  id: string
  title?: string
  description?: string
  link: string
  imageUrl?: string
  platform?: string // youtube, instagram, etc.
  order?: number
  createdAt?: Date
}
