import type { Category, Item } from "./types"

// Mock data - in production this would be a database
let categories: Category[] = [
  { id: "1", name: "Movies", type: "Film", image: "🎬", createdAt: new Date() },
  { id: "2", name: "TV Shows", type: "Television", image: "📺", createdAt: new Date() },
  { id: "3", name: "Music", type: "Audio", image: "🎵", createdAt: new Date() },
  { id: "4", name: "Actors", type: "People", image: "🎭", createdAt: new Date() },
  { id: "5", name: "Gaming", type: "Games", image: "🎮", createdAt: new Date() },
]

let items: Item[] = [
  {
    id: "1",
    categoryId: "1",
    title: "The Shawshank Redemption",
    description: "A timeless masterpiece",
    image: "🎬",
    imageUrl: "",
    rank: 1,
  },
  { id: "2", categoryId: "1", title: "The Godfather", description: "An epic tale", image: "🎬", imageUrl: "", rank: 2 },
  {
    id: "3",
    categoryId: "1",
    title: "The Dark Knight",
    description: "A dark epic",
    image: "🎬",
    imageUrl: "",
    rank: 3,
  },
]

export const categoryStore = {
  getAll: () => [...categories],
  getById: (id: string) => categories.find((c) => c.id === id),
  create: (category: Omit<Category, "id" | "createdAt">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    categories.push(newCategory)
    return newCategory
  },
  update: (id: string, updates: Partial<Category>) => {
    const index = categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      return categories[index]
    }
    return null
  },
  delete: (id: string) => {
    categories = categories.filter((c) => c.id !== id)
  },
}

export const itemStore = {
  getAll: () => [...items],
  getByCategoryId: (categoryId: string) =>
    items.filter((i) => i.categoryId === categoryId).sort((a, b) => a.rank - b.rank),
  create: (item: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    items.push(newItem)
    return newItem
  },
  update: (id: string, updates: Partial<Item>) => {
    const index = items.findIndex((i) => i.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates }
      return items[index]
    }
    return null
  },
  delete: (id: string) => {
    items = items.filter((i) => i.id !== id)
  },
  updateRanks: (categoryId: string, newItems: Item[]) => {
    items = items.map((item) => {
      if (item.categoryId === categoryId) {
        const newItem = newItems.find((ni) => ni.id === item.id)
        return newItem ? { ...item, rank: newItem.rank } : item
      }
      return item
    })
  },
}
