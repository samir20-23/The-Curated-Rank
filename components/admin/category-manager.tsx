"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/lib/types"
import { categoryStore } from "@/lib/store"

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    setCategories(categoryStore.getAll())
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="glass-strong rounded-xl p-6">
            <div className="text-4xl mb-4">{category.image}</div>
            <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
            <p className="text-foreground/60">{category.type}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
