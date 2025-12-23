"use client"

import { useEffect, useState } from "react"
import type { List, Category } from "@/lib/types"
import {
  getListsByCategory,
  createList,
  updateList,
  deleteList,
  duplicateList,
  getCategories,
} from "@/lib/firebase-service"
import { ListModal } from "./list-modal"
import { DeleteConfirmationModal } from "./delete-confirmation-modal"

export function ListView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [lists, setLists] = useState<List[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<List | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<List | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      loadLists()
    } else {
      setLists([])
    }
  }, [selectedCategoryId])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLists = async () => {
    try {
      const data = await getListsByCategory(selectedCategoryId)
      setLists(data)
    } catch (error) {
      console.error("Error loading lists:", error)
    }
  }

  const handleOpenModal = (list?: List) => {
    setSelectedList(list || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedList(null)
  }

  const handleSave = async (data: Omit<List, "id" | "createdAt" | "updatedAt" | "items">) => {
    try {
      if (selectedList) {
        await updateList(selectedList.id, data)
      } else {
        await createList({ ...data, items: [], stats: { views: 0, likes: 0, saves: 0 } } as List)
      }
      await loadLists()
    } catch (error) {
      console.error("Error saving list:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteList(deleteTarget.id)
      await loadLists()
      setDeleteTarget(null)
    } catch (error) {
      console.error("Error deleting list:", error)
      throw error
    }
  }

  const handleDuplicate = async (list: List) => {
    try {
      await duplicateList(list.id)
      await loadLists()
    } catch (error) {
      console.error("Error duplicating list:", error)
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Lists</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 transition"
        >
          Create List
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`p-4 rounded-lg border transition text-left ${
              selectedCategoryId === category.id
                ? "border-emerald-400 bg-emerald-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <h3 className="font-semibold text-white">{category.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{category.description}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          {categories.find((c) => c.id === selectedCategoryId)?.name || "Select a category"} - Lists
        </h3>

        {lists.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-white/10 bg-white/5 text-slate-400">
            <p>No lists in this category yet.</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30 transition"
            >
              Create the first list
            </button>
          </div>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                {list.coverImage && (
                  <img
                    src={list.coverImage || "/placeholder.svg"}
                    alt={list.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-white">{list.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-1">{list.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>👁 {list.stats.views}</span>
                    <span>👍 {list.stats.likes}</span>
                    <span>💾 {list.stats.saves}</span>
                    {list.editorPick && <span className="text-amber-300">⭐ Editor Pick</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicate(list)}
                  className="px-4 py-2 rounded-lg border border-blue-400/50 text-blue-300 hover:bg-blue-400/10 transition text-sm"
                  title="Duplicate this list"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleOpenModal(list)}
                  className="px-4 py-2 rounded-lg border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(list)}
                  className="px-4 py-2 rounded-lg border border-red-400/50 text-red-300 hover:bg-red-400/10 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ListModal
        isOpen={isModalOpen}
        list={selectedList}
        categoryId={selectedCategoryId}
        categories={categories}
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
