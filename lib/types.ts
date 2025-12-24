export interface Category {
  id: string
  name: string
  type: string // Keep for backward compatibility
  tags?: string[] // New tags array
  image: string
  imageUrl?: string
  createdAt?: Date
}

export interface Item {
  id: string
  categoryId: string
  title: string
  description: string
  type?: string // Type selected from category tags
  image: string
  imageUrl?: string
  rank: number
  createdAt?: Date
}
