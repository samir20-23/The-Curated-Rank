"use client"

import type React from "react"
import { useState } from "react"
import type { Item } from "@/lib/types"

interface DraggableItemListProps {
  items: Item[]
  onReorder: (items: Item[]) => void
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
}

export default function DraggableItemList({ items, onReorder, onEdit, onDelete }: DraggableItemListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [currentItems, setCurrentItems] = useState(items)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (draggedId === targetId) return

    const draggedIndex = currentItems.findIndex((i) => i.id === draggedId)
    const targetIndex = currentItems.findIndex((i) => i.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newItems = [...currentItems]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    const rerankedItems = newItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    }))

    setCurrentItems(rerankedItems)
  }

  const handleDragEnd = () => {
    if (draggedId) {
      onReorder(currentItems)
    }
    setDraggedId(null)
  }

  return (
    <div className="space-y-3">
      {currentItems.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragEnd={handleDragEnd}
          className={`group glass-strong rounded-lg overflow-hidden transition-all ${
            draggedId === item.id ? "opacity-50 scale-95" : "hover:scale-105 hover:shadow-2xl"
          }`}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors cursor-move">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 100 2 1 1 0 000-2zM10 8a1 1 0 100 2 1 1 0 000-2zM10 13a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>

            {/* Item image */}
            <div className="flex-shrink-0 w-16 h-16">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📌</span>
                </div>
              )}
            </div>

            {/* Rank badge */}
            <div className="flex-shrink-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg w-12 h-12 flex items-center justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                #{item.rank}
              </span>
            </div>

            {/* Item info */}
            <div className="flex-grow">
              <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
              <p className="text-foreground/60 text-sm line-clamp-1">{item.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="px-3 py-1 glass text-foreground hover:bg-secondary/30 rounded text-sm font-medium transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item)}
                className="px-3 py-1 glass text-red-400 hover:bg-red-500/20 rounded text-sm font-medium transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
