"use client"

import { useState, useEffect } from "react"
import type { Category } from "@/lib/types"
import { categoryStore } from "@/lib/store"
import CreateCategoryDialog from "./create-category-dialog"
import DeleteConfirmation from "./delete-confirmation"

interface AdminDashboardProps {
  onCategorySelect: (id: string) => void
}

export default function AdminDashboard({ onCategorySelect }: AdminDashboardProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  useEffect(() => {
    setCategories(categoryStore.getAll())
  }, [])

  const handleCreate = (category: Category) => {
    setCategories(categoryStore.getAll())
    setIsCreateOpen(false)
  }

  const handleDelete = (category: Category) => {
    categoryStore.delete(category.id)
    setCategories(categoryStore.getAll())
    setDeleteCategory(null)
  }

  const handleEdit = (category: Category) => {
    setCategories(categoryStore.getAll())
    setEditCategory(null)
  }

  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-1xl md:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground/60 mt-2">Manage categories and content</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover-lift"
          >
            Create Category
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group glass-strong rounded-xl p-6 hover-lift cursor-pointer"
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="text-5xl mb-4">{category.image}</div>
              <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-foreground/60 mt-2">Type: {category.type}</p>

              <div className="flex gap-2 mt-6 pt-6 border-t border-border/20">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditCategory(category)
                  }}
                  className="flex-1 px-3 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg text-sm font-medium transition duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteCategory(category)
                  }}
                  className="flex-1 px-3 py-2 glass text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateCategoryDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreate}
        editingCategory={editCategory}
        onEditClose={() => setEditCategory(null)}
        onEditSuccess={handleEdit}
      />

      <DeleteConfirmation
        isOpen={deleteCategory !== null}
        title={`Delete "${deleteCategory?.name}"?`}
        description="This action cannot be undone. All items in this category will be removed."
        onConfirm={() => deleteCategory && handleDelete(deleteCategory)}
        onCancel={() => setDeleteCategory(null)}
      />
    </div>
  )
}
