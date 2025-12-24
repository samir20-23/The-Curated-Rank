"use client"

import { useState } from "react"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import CreateItemDialog from "./create-item-dialog"
import DeleteConfirmation from "./delete-confirmation"
import DraggableItemList from "./draggable-item-list"
import type { Category, Item } from "@/lib/types"

interface CategoryItemsManagerProps {
  category: Category
  onBack: () => void
}

export default function CategoryItemsManager({ category, onBack }: CategoryItemsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const { items, loading, deleteItem: deleteItemFromFirebase, updateRanks } = useFirebaseItems(category.id)

  const handleDelete = async (item: Item) => {
    try {
      await deleteItemFromFirebase(item.id)
      setDeleteItem(null)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  const handleReorder = async (newItems: Item[]) => {
    try {
      await updateRanks(newItems)
    } catch (error) {
      console.error("Reorder failed:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-4xl font-bold text-foreground">{category.name}</h2>
            <p className="text-foreground/60 mt-1">Type: {category.type}</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 hover:shadow-2xl transition duration-300"
        >
          Add Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-foreground/60">Loading items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: "100%"
        }}>
          <p className="text-foreground/60 text-sm">Drag items up or down to reorder them</p>
          <DraggableItemList items={items} onReorder={handleReorder} onEdit={setEditItem} onDelete={setDeleteItem} />
        </div>
      ) : (
        <div className="text-center py-12 glass-strong rounded-xl">
          <p className="text-foreground/60 mb-4">No items yet. Create your first one!</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
          >
            Add Item
          </button>
        </div>
      )}

      <CreateItemDialog
        isOpen={isCreateOpen}
        categoryId={category.id}
        categoryName={category.name}
        onClose={() => setIsCreateOpen(false)}
        editingItem={editItem}
        onEditClose={() => setEditItem(null)}
      />

      <DeleteConfirmation
        isOpen={deleteItem !== null}
        title={`Delete "${deleteItem?.title}"?`}
        description="This action cannot be undone."
        onConfirm={() => deleteItem && handleDelete(deleteItem)}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  )
}
