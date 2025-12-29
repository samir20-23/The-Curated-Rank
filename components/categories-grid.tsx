"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import CategoryCard from "./category-card"
import CreateCategoryDialog from "@/components/admin/create-category-dialog"
import Loading from "@/components/loading"

interface CategoriesGridProps {
  selectedCategory?: string | null
  onCategorySelect?: (category: string | null) => void
}

export default function CategoriesGrid({ selectedCategory, onCategorySelect }: CategoriesGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [minLoadingDone, setMinLoadingDone] = useState(false)

  const router = useRouter()
  const { categories, loading, updateCategoriesOrder } = useFirebaseCategories()
  const { isAdmin } = useAuth()
  const { t } = useLanguage()

  // Start a 6-second minimum loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingDone(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`)
  }

  const isStillLoading = loading || !minLoadingDone

  return (
    <div>
      <div className="flex items-center justify-between mb-12 flex-wrap gap-4" style={{ width: "100%" }}>
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{t("category.title")}</h2>
          <p className="text-foreground/60">{t("category.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition"
            >
              {t("admin.createCategory")}
            </button>
          )}
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${viewMode === "grid" ? "glass-strong text-primary" : "glass hover:bg-secondary/30"
              }`}
            style={viewMode === "grid" ? { boxShadow: "0 0 40px oklch(0.65 0.25 270 / 0.3)" } : {}}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${viewMode === "list" ? "glass-strong text-primary" : "glass hover:bg-secondary/30"
              }`}
            style={viewMode === "list" ? { boxShadow: "0 0 40px oklch(0.65 0.25 270 / 0.3)" } : {}}
          >
            List
          </button>
        </div>
      </div>

      {isStillLoading ? (
        <div className="text-center py-12">
          <div className="text-foreground/60"><Loading /></div>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {categories.map((category) => (
            <div key={category.id} draggable={isAdmin}
              onDragStart={(e) => { if (!isAdmin) return; e.dataTransfer?.setData("text/plain", category.id) }}
              onDragOver={(e) => { if (!isAdmin) return; e.preventDefault() }}
              onDrop={async (e) => {
                if (!isAdmin) return
                const draggedId = e.dataTransfer.getData("text/plain")
                if (!draggedId || draggedId === category.id) return
                const srcIndex = categories.findIndex(c => c.id === draggedId)
                const destIndex = categories.findIndex(c => c.id === category.id)
                if (srcIndex === -1 || destIndex === -1) return
                const newCats = [...categories]
                const [moved] = newCats.splice(srcIndex, 1)
                newCats.splice(destIndex, 0, moved)
                try { await updateCategoriesOrder(newCats) } catch (err) { console.error(err) }
              }}
            >
              <CategoryCard
                id={category.id}
                title={category.name}
                type={category.type}
                imageUrl={category.imageUrl}
                onClick={() => handleCategoryClick(category.id)}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">{t("category.noCategories")}</p>
        </div>
      )}

      {isAdmin && <CreateCategoryDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />}
    </div>
  )
}
