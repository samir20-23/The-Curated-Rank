"use client"

import { useState, useEffect } from "react"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useLanguage } from "@/contexts/language-context"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export default function CategoryCharts() {
  const { categories } = useFirebaseCategories()
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [categoryStats, setCategoryStats] = useState<Array<{ name: string; count: number; id: string }>>([])

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await Promise.all(
        categories.map(async (category) => {
          try {
            const itemsQuery = query(collection(db, "items"), where("categoryId", "==", category.id))
            const itemsSnapshot = await getDocs(itemsQuery)
            return {
              name: category.name,
              count: itemsSnapshot.size,
              id: category.id
            }
          } catch (error) {
            return { name: category.name, count: 0, id: category.id }
          }
        })
      )
      setCategoryStats(stats)
    }

    if (categories.length > 0) {
      fetchStats()
    }
  }, [categories])

  const displayedCharts = showMore ? categoryStats : categoryStats.slice(0, 3)

  if (categoryStats.length === 0) return null

  const maxCount = Math.max(...categoryStats.map(s => s.count), 1)

  return (
    <div className="mt-16 mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">
          {t("category.title")} Statistics
        </h2>
        {categoryStats.length > 3 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg text-sm font-medium transition"
          >
            {showMore ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedCharts.map((stat) => (
          <div
            key={stat.id}
            className="glass-strong rounded-xl p-6 space-y-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setSelectedCategory(selectedCategory === stat.id ? null : stat.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">{stat.name}</h3>
              <span className="text-2xl font-bold text-primary">{stat.count}</span>
            </div>
            <div className="w-full h-4 bg-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${(stat.count / maxCount) * 100}%` }}
              />
            </div>
            {selectedCategory === stat.id && (
              <div className="mt-4 p-4 glass rounded-lg">
                <p className="text-sm text-foreground/80">
                  {stat.count} {stat.count === 1 ? "item" : "items"} in this category
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

