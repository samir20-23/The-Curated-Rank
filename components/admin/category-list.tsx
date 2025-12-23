"use client"

import { useEffect, useState } from "react"
import type { Category } from "@/lib/types"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/firebase-service"
import { CategoryModal } from "./category-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (category?: Category) => {
    setSelectedCategory(category || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCategory(null)
  }

  const handleSave = async (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data)
      } else {
        await createCategory(data)
      }
      await loadCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget.id)
      await loadCategories()
      setDeleteTarget(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Loading categories...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Categories</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 transition"
        >
          Create Category
        </button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-4 flex-1">
              {category.coverImage && (
                <img
                  src={category.coverImage || "/placeholder.svg"}
                  alt={category.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-white">{category.name}</h3>
                <p className="text-sm text-slate-400">{category.description}</p>
                <div className="flex gap-2 mt-2">
                  {category.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(category)}
                className="px-4 py-2 rounded-lg border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10 transition"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(category)}
                className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-400/10 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal isOpen={isModalOpen} category={selectedCategory} onClose={handleCloseModal} onSave={handleSave} />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
