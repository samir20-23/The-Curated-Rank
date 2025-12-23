"use client"

import type React from "react"

import { useState } from "react"
import type { ListItem } from "@/lib/types"

interface DraggableItemListProps {
  items: ListItem[]
  onReorder: (items: ListItem[]) => Promise<void>
  onEdit: (item: ListItem) => void
  onDelete: (item: ListItem) => void
}

export function DraggableItemList({ items, onReorder, onEdit, onDelete }: DraggableItemListProps) {
  const [displayItems, setDisplayItems] = useState<ListItem[]>(items)
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const handleDragStart = (item: ListItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnItem = (dropTarget: ListItem) => {
    if (!draggedItem || draggedItem.id === dropTarget.id) return

    const draggedIndex = displayItems.findIndex((i) => i.id === draggedItem.id)
    const targetIndex = displayItems.findIndex((i) => i.id === dropTarget.id)

    const newItems = [...displayItems]
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    // Update positions
    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }))

    setDisplayItems(reorderedItems)
    setDraggedItem(null)
    performReorder(reorderedItems)
  }

  const performReorder = async (items: ListItem[]) => {
    setIsReordering(true)
    try {
      await onReorder(items)
    } catch (error) {
      console.error("Error reordering items:", error)
      // Revert on error
      setDisplayItems(items)
    } finally {
      setIsReordering(false)
    }
  }

  return (
    <div className="space-y-2">
      {displayItems.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(item)}
          onDragOver={handleDragOver}
          onDrop={() => handleDropOnItem(item)}
          className={`flex items-center gap-4 p-4 rounded-lg border transition cursor-grab active:cursor-grabbing ${
            draggedItem?.id === item.id
              ? "border-emerald-400 bg-emerald-400/10 opacity-50"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
        >
          {/* Drag handle */}
          <div className="flex items-center justify-center w-8 h-8 rounded bg-white/10 text-slate-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4zm4-2a2 2 0 100-4 2 2 0 000 4zm0 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>

          {/* Position badge */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400/20 text-emerald-300 font-bold flex-shrink-0">
            {index + 1}
          </div>

          {/* Item preview */}
          <div className="flex items-center gap-4 flex-1">
            {item.coverImage && (
              <img
                src={item.coverImage || "/placeholder.svg"}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{item.title}</h3>
              <p className="text-sm text-slate-400 truncate">{item.description}</p>
              <div className="flex gap-3 mt-1 text-xs text-slate-500">
                {item.year && <span>{item.year}</span>}
                {item.director && <span>Dir: {item.director}</span>}
                {item.imdbRating && <span>Rating: {item.imdbRating}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="px-3 py-1 rounded text-sm border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400/10 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="px-3 py-1 rounded text-sm border border-red-400/50 text-red-300 hover:bg-red-400/10 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
