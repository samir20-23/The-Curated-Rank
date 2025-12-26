"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import CreateCategoryDialog from "@/components/admin/create-category-dialog"
import DeleteConfirmation from "@/components/admin/delete-confirmation"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useLanguage } from "@/contexts/language-context"

interface CategoryCardProps {
  id: string
  title: string
  type: string
  imageUrl?: string
  onClick: () => void
}

export default function CategoryCard({ id, title, type, imageUrl, onClick }: CategoryCardProps) {
  const { isAdmin } = useAuth()
  const { deleteCategory, categories } = useFirebaseCategories()
  const { t } = useLanguage()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const category = categories.find(c => c.id === id)
  // Get types from tags or type field
  const categoryTypes = category?.tags && category.tags.length > 0 
    ? category.tags.join(", ") 
    : (category?.type || type || "")

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    setShowConfirmDelete(true)
  }

  const handleFinalDelete = async () => {
    try {
      await deleteCategory(id)
      setIsDeleteOpen(false)
      setShowConfirmDelete(false)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <>
      <div
        className="group relative p-6 glass-strong rounded-xl hover-lift overflow-hidden text-left h-64 cursor-pointer"
        onClick={onClick}
      >
        {/* Background image with opacity */}
        {imageUrl && (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-60" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            {categoryTypes && (
              <p className="text-xs line-clamp-7 text-foreground" style={{ opacity: 0.5 }}>
                {categoryTypes}
              </p>
            )}
          </div>
          {/* <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
           <p className="text-foreground/60 text-sm line-clamp-1">{item.description}</p> */}
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 glass text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition  flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300 ">
           
              <span className="text-sm font-medium">{t("category.viewItems")}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {isAdmin && (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {/* <button
                  onClick={handleManage}
                  className="px-3 py-1 glass text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition"
                  title={t("admin.manageItems")}
                >
                  {t("admin.manageItems")}
                </button> */}
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 glass text-foreground hover:bg-secondary/30 rounded-lg text-xs font-medium transition"
                  title={t("admin.edit")}
                >
                  {t("admin.edit")}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 glass text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition"
                  title={t("admin.delete")}
                >
                  {t("admin.delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && category && (
        <>
          <CreateCategoryDialog
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            editingCategory={category}
          />
          {!showConfirmDelete ? (
            <DeleteConfirmation
              isOpen={isDeleteOpen}
              title={`${t("admin.delete")} "${title}"?`}
              description={t("admin.deleteConfirm")}
              onConfirm={handleConfirmDelete}
              onCancel={() => setIsDeleteOpen(false)}
            />
          ) : (
            <DeleteConfirmation
              isOpen={showConfirmDelete}
              title={`${t("admin.areYouSure")}?`}
              description={t("admin.finalDelete")}
              onConfirm={handleFinalDelete}
              onCancel={() => {
                setShowConfirmDelete(false)
                setIsDeleteOpen(false)
              }}
            />
          )}
        </>
      )}
    </>
  )
}
