"use client"

import { useState } from "react"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import CategoryCard from "./category-card"
import CategoryListView from "./category-list-view"

interface CategoriesGridProps {
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
}

export default function CategoriesGrid({ selectedCategory, onCategorySelect }: CategoriesGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { categories, loading } = useFirebaseCategories()

  if (selectedCategory) {
    return <CategoryListView categoryId={selectedCategory} onBack={() => onCategorySelect(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Categories</h2>
          <p className="text-foreground/60">Explore our curated collections</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              viewMode === "grid" ? "glass-strong text-primary" : "glass hover:bg-secondary/30"
            }`}
            style={viewMode === "grid" ? { boxShadow: "0 0 40px oklch(0.65 0.25 270 / 0.3)" } : {}}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
              viewMode === "list" ? "glass-strong text-primary" : "glass hover:bg-secondary/30"
            }`}
            style={viewMode === "list" ? { boxShadow: "0 0 40px oklch(0.65 0.25 270 / 0.3)" } : {}}
          >
            List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-foreground/60">Loading categories...</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              id={category.id}
              title={category.name}
              type={category.type}
              imageUrl={category.imageUrl}
              onClick={() => onCategorySelect(category.id)}
            />
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No categories available yet.</p>
        </div>
      )}
    </div>
  )
}
