"use client"

import { useEffect, useState } from "react"
import type { ListItem, List } from "@/lib/types"
import {
  getListsByCategory,
  getListItems,
  createListItem,
  updateListItem,
  deleteListItem,
  updateListItemPosition,
  getCategories,
} from "@/lib/firebase-service"
import { ItemModal } from "./item-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"
import { DraggableItemList } from "./draggable-item-list"

export function ItemView() {
  const [categories, setCategories] = useState<any[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string>("")
  const [items, setItems] = useState<ListItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
      if (data.length > 0) {
        loadLists(data[0].id)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLists = async (categoryId: string) => {
    try {
      const data = await getListsByCategory(categoryId)
      setLists(data)
      if (data.length > 0 && !selectedListId) {
        loadItems(data[0].id)
      }
    } catch (error) {
      console.error("Error loading lists:", error)
    }
  }

  const loadItems = async (listId: string) => {
    try {
      setSelectedListId(listId)
      const data = await getListItems(listId)
      setItems(data)
    } catch (error) {
      console.error("Error loading items:", error)
    }
  }

  const handleOpenModal = (item?: ListItem) => {
    setSelectedItem(item || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleSave = async (data: Omit<ListItem, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (selectedItem) {
        await updateListItem(selectedItem.id, data)
      } else {
        // Set position as the next index
        const nextPosition = items.length + 1
        await createListItem({ ...data, position: nextPosition })
      }
      await loadItems(selectedListId)
    } catch (error) {
      console.error("Error saving item:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteListItem(deleteTarget.id)
      await loadItems(selectedListId)
      setDeleteTarget(null)
    } catch (error) {
      console.error("Error deleting item:", error)
      throw error
    }
  }

  const handleReorder = async (reorderedItems: ListItem[]) => {
    try {
      await updateListItemPosition(selectedListId, reorderedItems)
      setItems(reorderedItems)
    } catch (error) {
      console.error("Error reordering items:", error)
      throw error
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">List Items</h2>
        {selectedListId && (
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 transition"
          >
            Add Item
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Select Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => loadLists(category.id)}
              className="p-2 rounded-lg border transition text-left text-sm hover:bg-white/5 border-white/10"
            >
              <p className="font-medium text-white">{category.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* List selector */}
      {lists.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Select List</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => loadItems(list.id)}
                className={`p-3 rounded-lg border transition text-left ${
                  selectedListId === list.id
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <h4 className="font-semibold text-white text-sm">{list.title}</h4>
                <p className="text-xs text-slate-400">{list.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Items display */}
      {selectedListId && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Items ({items.length})</h3>

          {items.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-white/10 bg-white/5 text-slate-400">
              <p>No items in this list yet.</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 transition"
              >
                Add the first item
              </button>
            </div>
          ) : (
            <DraggableItemList
              items={items}
              onReorder={handleReorder}
              onEdit={handleOpenModal}
              onDelete={(item) => setDeleteTarget(item)}
            />
          )}
        </div>
      )}

      <ItemModal
        isOpen={isModalOpen}
        item={selectedItem}
        listId={selectedListId}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.title || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
