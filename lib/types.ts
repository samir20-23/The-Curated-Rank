export interface Category {
  id: string
  name: string
  type: string
  image: string
  imageUrl?: string
  createdAt?: Date
}

export interface Item {
  id: string
  categoryId: string
  title: string
  description: string
  image: string
  imageUrl?: string
  rank: number
  createdAt?: Date
}
