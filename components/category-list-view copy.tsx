// CategoryListView.tsx
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import CreateItemDialog from "@/components/admin/create-item-dialog"
import DeleteConfirmation from "@/components/admin/delete-confirmation"
import "./list.css"
import type { Item } from "@/lib/types"
import Loading from "./loading"
interface CategoryListViewProps {
  categoryId: string
  onBack?: () => void
}

export default function CategoryListView({ categoryId }: CategoryListViewProps) {
  const [filterText, setFilterText] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterRank, setFilterRank] = useState<string>("")
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editingTypeValue, setEditingTypeValue] = useState("")
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const router = useRouter()
  const { items, loading: itemsLoading, updateRanks, updateItem, deleteItem } = useFirebaseItems(categoryId)
  const { categories, updateCategory } = useFirebaseCategories()
  const { isAdmin } = useAuth()
  const { t } = useLanguage()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedType, setDraggedType] = useState<string | null>(null)
  const [dragDirection, setDragDirection] = useState<"up" | "down" | null>(null)
  const [autoScrollMap, setAutoScrollMap] = useState<Record<string, "up" | "down" | null>>({})
  const [dragOverType, setDragOverType] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const columnsRef = useRef<Record<string, HTMLDivElement | null>>({})

  const category = categories.find((c) => c.id === categoryId)
  const useTypes = category?.useTypes !== false // Default true
  const availableTypes = useTypes ? (category?.tags || (category?.type ? category.type.split(", ").map(t => t.trim()) : [])) : []

  // Group items by type (only types that have items)
  const itemsByType = useTypes && availableTypes.length > 0
    ? availableTypes.reduce((acc, type) => {
      const typeItems = items
        .filter(item => item.type === type)
        .sort((a, b) => a.rank - b.rank)
      if (typeItems.length > 0) {
        acc[type] = typeItems
      }
      return acc
    }, {} as Record<string, Item[]>)
    : null

  useEffect(() => {
    if (!itemsByType) return
    const map: Record<string, "up" | "down" | null> = {}
    Object.keys(itemsByType).forEach((type) => {
      const r = Math.random()
      if (r > 0.88) map[type] = "up"
      else if (r > 0.76) map[type] = "down"
      else map[type] = null
    })
    setAutoScrollMap(map)
  }, [JSON.stringify(itemsByType)])

  // Page auto-scroll while dragging (near viewport edges)
  useEffect(() => {
    const onDragOverWindow = (e: DragEvent) => {
      if (!isDragging) return
      const y = e.clientY
      const threshold = 80
      const speed = 30
      if (y < threshold) {
        window.scrollBy({ top: -speed, behavior: "auto" })
      } else if (window.innerHeight - y < threshold) {
        window.scrollBy({ top: speed, behavior: "auto" })
      }
    }
    window.addEventListener("dragover", onDragOverWindow)
    return () => window.removeEventListener("dragover", onDragOverWindow)
  }, [isDragging])

  // Items without type
  const itemsWithoutType = items.filter(item => !item.type || (availableTypes.length > 0 && !availableTypes.includes(item.type)))

  // Filter items for normal list
  const filteredItems = items.filter((item) => {
    const matchesText = !filterText || (item.title || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(filterText.toLowerCase())
    const matchesType = !filterType || item.type === filterType
    const matchesRank = !filterRank || item.rank.toString() === filterRank || item.rank.toString().includes(filterRank)
    return matchesText && matchesType && matchesRank
  }).sort((a, b) => a.rank - b.rank)

  // Filter items by type for column view
  const getFilteredItemsByType = (type: string) => {
    if (!itemsByType) return []
    const typeItems = itemsByType[type] || []
    return typeItems.filter((item) => {
      const matchesText = !filterText || (item.title || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(filterText.toLowerCase())
      const matchesRank = !filterRank || item.rank.toString() === filterRank || item.rank.toString().includes(filterRank)
      return matchesText && matchesRank
    })
  }

  const computeIndexFromContainer = (container: Element, clientY: number) => {
    // Build array of child draggable items (skip the dashed drop zones)
    const children = Array.from(container.querySelectorAll<HTMLElement>(".draggable-item"))
    // If no children, drop index is 0
    if (children.length === 0) return 0
    // Get mouse position relative to container scroll
    const rect = container.getBoundingClientRect()
    const scrollTop = (container as HTMLElement).scrollTop || 0
    const mouseY = clientY - rect.top + scrollTop
    // Find midpoint of each child
    let currentTop = 0
    for (let i = 0; i < children.length; i++) {
      const ch = children[i]
      const h = ch.offsetHeight
      const mid = currentTop + h / 2
      if (mouseY < mid) return i
      currentTop += h
    }
    return children.length // last
  }

  const handleDragStart = (itemId: string, type?: string, e?: React.DragEvent) => {
    if (!isAdmin) return
    setDraggedId(itemId)
    setDraggedType(type || null)
    setDragDirection(null)
    setDragOverType(null)
    setDragOverIndex(null)
    setIsDragging(true)

    if (e) {
      // Use a small transparent image and set it once it's loaded
      const img = new Image()
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
      // ensure setDragImage called after load to avoid browser fallback showing ghost at top
      img.onload = () => {
        try {
          e.dataTransfer.setDragImage(img, 0, 0)
        } catch (err) {
          // ignore
        }
      }
      // fallback immediate call for some browsers
      try {
        e.dataTransfer.setDragImage(img, 0, 0)
      } catch (err) {
        // ignore
      }
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragOver = (e: React.DragEvent, targetId?: string, type?: string, index?: number) => {
    if (!isAdmin || !draggedId) return
    e.preventDefault()
    e.stopPropagation()

    if (type !== undefined) {
      setDragOverType(type)
      if (index !== undefined) {
        setDragOverIndex(index)
      }
    }

    // If target container present, compute direction with actual DOM indices
    if (targetId && e.currentTarget) {
      // compute using filtered lists
      let draggedIndex: number, targetIndex: number
      if (useTypes && draggedType) {
        const typeItems = itemsByType?.[draggedType] || []
        draggedIndex = typeItems.findIndex((i) => i.id === draggedId)
        targetIndex = typeItems.findIndex((i) => i.id === targetId)
      } else {
        draggedIndex = filteredItems.findIndex((i) => i.id === draggedId)
        targetIndex = filteredItems.findIndex((i) => i.id === targetId)
      }
      if (draggedIndex !== -1 && targetIndex !== -1) {
        setDragDirection(draggedIndex > targetIndex ? "up" : "down")
      }
    }
  }

  const handleDrop = async (targetId: string | null, type?: string, dropIndex?: number) => {
    if (!isAdmin || !draggedId) {
      setIsDragging(false)
      setDraggedId(null)
      setDraggedType(null)
      setDragOverType(null)
      setDragOverIndex(null)
      return
    }

    try {
      let itemsToReorder: Item[]

      if (useTypes && type) {
        const sourceType = draggedType || undefined
        const targetType = type || undefined
        const sourceItems = sourceType ? (itemsByType?.[sourceType] || []) : items.filter(i => !i.type).sort((a, b) => a.rank - b.rank)
        const targetItems = targetType ? (itemsByType?.[targetType] || []) : items.filter(i => !i.type).sort((a, b) => a.rank - b.rank)

        const draggedIndex = sourceItems.findIndex((i) => i.id === draggedId)
        if (draggedIndex === -1) {
          // abort gracefully
          setIsDragging(false)
          setDraggedId(null)
          setDraggedType(null)
          setDragOverType(null)
          setDragOverIndex(null)
          return
        }

        let targetIndex: number
        if (typeof dropIndex === "number") {
          targetIndex = Math.max(0, Math.min(dropIndex, targetItems.length))
        } else if (targetId) {
          targetIndex = targetItems.findIndex((i) => i.id === targetId)
          if (targetIndex === -1) targetIndex = targetItems.length
        } else {
          targetIndex = targetItems.length
        }

        // Clone arrays and move item
        const newSource = [...sourceItems]
        const [draggedItem] = newSource.splice(draggedIndex, 1)
        const newTarget = [...targetItems]

        // Adjust targetIndex if dragging within same list and source index < targetIndex
        if (sourceType === targetType && draggedIndex < targetIndex) {
          targetIndex -= 1
        }

        newTarget.splice(targetIndex, 0, draggedItem)

        const sourceUpdates = newSource.map((item, idx) => ({ ...item, rank: idx + 1 }))
        const targetUpdates = newTarget.map((item, idx) => ({ ...item, rank: idx + 1, type: targetType }))

        // If we moved across types, update the moved item's type first
        if (sourceType !== targetType) {
          await updateItem(draggedId, { type: targetType || undefined })
        }

        itemsToReorder = [...sourceUpdates, ...targetUpdates]
      } else {
        // Reorder in normal list
        const draggedIndex = filteredItems.findIndex((i) => i.id === draggedId)
        if (draggedIndex === -1) {
          setIsDragging(false)
          setDraggedId(null)
          setDraggedType(null)
          setDragOverType(null)
          setDragOverIndex(null)
          return
        }

        let targetIndex: number
        if (typeof dropIndex === "number") {
          targetIndex = Math.max(0, Math.min(dropIndex, filteredItems.length))
        } else if (targetId) {
          targetIndex = filteredItems.findIndex((i) => i.id === targetId)
          if (targetIndex === -1) targetIndex = filteredItems.length
        } else {
          targetIndex = filteredItems.length
        }

        const newItems = [...filteredItems]
        const [draggedItem] = newItems.splice(draggedIndex, 1)

        if (draggedIndex < targetIndex) {
          targetIndex -= 1
        }

        newItems.splice(targetIndex, 0, draggedItem)

        itemsToReorder = newItems.map((item, index) => ({
          ...item,
          rank: index + 1,
        }))
      }

      await updateRanks(itemsToReorder)
    } catch (error) {
      console.error("Error updating ranks:", error)
    } finally {
      setDraggedId(null)
      setDraggedType(null)
      setDragOverType(null)
      setDragOverIndex(null)
      setDragDirection(null)
      setIsDragging(false)
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDraggedType(null)
    setDragDirection(null)
    setDragOverType(null)
    setDragOverIndex(null)
    setIsDragging(false)
  }

  const handleTypeDoubleClick = (type: string) => {
    if (!isAdmin) return
    const typeItems = itemsByType?.[type] || []
    if (typeItems.length > 0) {
      setEditingType(type)
      setEditingTypeValue(type)
    }
  }

  const handleTypeSave = async () => {
    if (!editingType || !category) return

    const oldType = editingType
    const newType = editingTypeValue.trim()

    if (!newType) {
      const typeItems = itemsByType?.[oldType] || []
      if (typeItems.length > 0) {
        alert("Cannot delete type that has items. Please remove items first.")
        setEditingType(null)
        setEditingTypeValue("")
        return
      }
    }

    if (newType && newType !== oldType) {
      const updatedTags = availableTypes.map(t => t === oldType ? newType : t)
      await updateCategory(categoryId, {
        tags: updatedTags,
        type: updatedTags.join(", "),
      })

      const itemsToUpdate = items.filter(item => item.type === oldType)
      for (const item of itemsToUpdate) {
        await updateItem(item.id, { type: newType })
      }
    }

    setEditingType(null)
    setEditingTypeValue("")
  }

  const handleTypeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTypeSave()
    } else if (e.key === "Escape") {
      setEditingType(null)
      setEditingTypeValue("")
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget.id)
      setDeleteTarget(null)
      setShowConfirmDelete(false)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleDeleteClick = (item: Item) => {
    setDeleteTarget(item)
    setShowConfirmDelete(false)
  }

  // Normal list view
  if (!useTypes || availableTypes.length === 0 || availableTypes.length === 1 || Object.keys(itemsByType || {}).length === 0 || Object.keys(itemsByType || {}).length === 1) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between " style={{ padding: "20px 40px 0px 40px" }}>
          <div className="flex items-center gap-1">
            <button style={{ cursor: "pointer" }} onClick={() => router.push("/")} className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-1xl md:text-2xl font-bold text-foreground">{category?.name}</h2>
            </div>
          </div>
          {isAdmin && (
            <button style={{ cursor: "pointer" }}
              onClick={() => setIsCreateItemOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition"
            >
              {t("admin.createItem")}
            </button>
          )}
        </div>

        <div className="glass-strong rounded-xl p-4 space-y-3" style={{ margin: "10px 40px 12px 40px" }} >
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder={t("item.search")}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 min-w-[200px] bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none border border-border/50 rounded-lg px-3 py-2"
            />
            {useTypes && availableTypes.length > 0 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 glass rounded-lg text-foreground focus:outline-none border border-border/50"
              >
                <option value="">All Types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Filter by rank (e.g., 1, 2, 3)"
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value)}
              className="w-32 bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none border border-border/50 rounded-lg px-3 py-2"
            />
          </div>
        </div>
 <div className="text-center py-12">
            <div className="text-foreground/60"><Loading /></div>
          </div>
        {itemsLoading ? (
          <div className="text-center py-12">
            <div className="text-foreground/60"><Loading /></div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(item.id, undefined, e)}
                onDragOver={(e) => {
                  if (!isAdmin || !draggedId) return
                  e.preventDefault()
                  e.stopPropagation()
                  // compute index using DOM children of the list container
                  const listContainer = (e.currentTarget.parentElement as Element) // parent of this item is list container
                  if (listContainer) {
                    const idx = computeIndexFromContainer(listContainer, e.clientY)
                    setDragOverIndex(idx)
                    setDragOverType(null)
                  }
                }}
                onDragEnd={handleDragEnd}
                onDrop={(e) => {
                  e.preventDefault()
                  // compute final index from list container
                  const listContainer = (e.currentTarget.parentElement as Element)
                  const finalIndex = listContainer ? computeIndexFromContainer(listContainer, e.clientY) : filteredItems.length
                  handleDrop(item.id, undefined, finalIndex)
                }}
                onMouseDown={(e) => {
                  if (!isAdmin || (e.target as HTMLElement).closest("button")) {
                    e.preventDefault()
                  }
                }}
                onClick={(e) => {
                  if (!draggedId && !(e.target as HTMLElement).closest("button")) {
                    router.push(`/item/${item.id}`)
                  }
                }}
                className={`group draggable-item rounded-lg overflow-hidden transition-all flex items-center gap-4 p-4 ${isAdmin ? "cursor-grab" : "cursor-pointer"} ${draggedId === item.id ? "opacity-50 scale-95" : ""} ${isDragging && draggedId !== item.id ? "scale-90" : ""}`}
                style={{ background: undefined }}
              >
                <div className="relative w-full flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors cursor-move z-10">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a1 1 0 100 2 1 1 0 000-2zM10 8a1 1 0 100 2 1 1 0 000-2zM10 13a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                  </div>

                  <div className="flex-shrink-0 w-16 h-16 z-10">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl || "/placeholder.svg"} alt={item.title ?? ""} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📌</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 z-10">
                    <div className="bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg w-12 h-12 flex items-center justify-center">
                      <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">#{item.rank}</span>
                    </div>
                  </div>

                  <div className="flex-grow z-10">
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title ?? ""}</h4>
                    {item.description && <p className="text-foreground/60 text-sm line-clamp-1">{item.description}</p>}
                  </div>

                  <div className="flex gap-2 z-10">
                    {isAdmin && (
                      <>
                        <button style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingItem(item)
                          }}
                          className="px-3 py-1 glass text-foreground hover:bg-secondary/30 rounded text-sm font-medium transition duration-300"
                        >
                          {t("admin.edit")}
                        </button>

                        <button style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(item)
                          }}
                          className="px-3 py-1 glass text-red-400 hover:bg-red-500/20 rounded text-sm font-medium transition duration-300"
                        >
                          {t("admin.delete")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!itemsLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">{t("item.noItems")}</p>
          </div>
        )}

        {isAdmin && (
          <>
            <CreateItemDialog
              isOpen={isCreateItemOpen}
              categoryId={categoryId}
              categoryName={category?.name || ""}
              onClose={() => setIsCreateItemOpen(false)}
              editingItem={editingItem}
              onEditClose={() => setEditingItem(null)}
            />
            {!showConfirmDelete ? (
              <DeleteConfirmation
                isOpen={deleteTarget !== null}
                title={`${t("admin.delete")} "${deleteTarget?.title || "Item"}"?`}
                description={t("admin.deleteConfirm")}
                onConfirm={() => setShowConfirmDelete(true)}
                onCancel={() => setDeleteTarget(null)}
              />
            ) : (
              <DeleteConfirmation
                isOpen={showConfirmDelete}
                title={`${t("admin.areYouSure")}?`}
                description={t("admin.finalDelete")}
                onConfirm={handleDeleteItem}
                onCancel={() => {
                  setShowConfirmDelete(false)
                  setDeleteTarget(null)
                }}
                isSecondConfirm={true}
              />
            )}
          </>
        )}
      </div>
    )
  }

  // Column-based type view
  const typeColumns = Object.keys(itemsByType || {})
  const isSingleType = typeColumns.length === 1

  return (
    <div className={`space-y-8`}>
      <div className="flex items-center justify-between mb-8" style={{ padding: "20px 40px 0px 40px" }}>
        <div className="flex items-center gap-1">
          <button style={{ cursor: "pointer" }} onClick={() => router.push("/")} className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-1xl md:text-2xl font-bold text-foreground">{category?.name}</h2>
          </div>
        </div>
        {isAdmin && (
          <button style={{ cursor: "pointer" }}
            onClick={() => setIsCreateItemOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition"
          >
            {t("admin.createItem")}
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="glass-strong rounded-xl p-4 space-y-3" style={{ margin: "10px 40px 12px 40px" }}>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder={t("item.search")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none border border-border/50 rounded-lg px-3 py-2"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 glass rounded-lg text-foreground focus:outline-none border border-border/50"
          >
            <option value="">All Types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by rank (e.g., 1, 2, 3)"
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="w-40 bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none border border-border/50 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {itemsLoading ? (
        <div className="text-center py-12">
          <div className="text-foreground/60"><Loading /></div>
        </div>
      ) : (
        <div className={`${isSingleType ? "" : "overflow-x-auto"} pb-4 h-[1000px] ${isDragging ? "" : ""}`} style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none", width: "100%",
          paddingLeft: "20px",
          border: "1px solid rgba(161, 161, 161, 0.41)",
          boxShadow: "rgba(206, 177, 199, 0.71) 0px 0px 100px -68px inset"
        }}>
          <div className={`flex gap-6  ${isSingleType ? "justify-center" : ""}`} style={{ minWidth: isSingleType ? "auto" : "max-content" }}>
            {typeColumns
              .filter(type => !filterType || type === filterType)
              .map((type) => {
                const typeItems = getFilteredItemsByType(type)
                if (typeItems.length === 0 && (filterText || filterRank || filterType)) return null

                return (
                  <div
                    key={type}
                    className={`${isSingleType ? "w-full max-w-4xl" : "flex-shrink-0 w-64"} space-y-4`}
                    style={{ minWidth: isSingleType ? "auto" : "256px" }}
                  >
                    {/* Type Header */}
                    <div className="glass-strong rounded-lg p-4 sticky top-0 z-10" >
                      {editingType === type ? (
                        <input
                          type="text"
                          value={editingTypeValue}
                          onChange={(e) => setEditingTypeValue(e.target.value)}
                          onBlur={handleTypeSave}
                          onKeyDown={handleTypeKeyDown}
                          className="text-xl font-bold text-foreground bg-transparent border-b-2 border-primary focus:outline-none w-full px-2"
                          autoFocus
                        />
                      ) : (
                        <h3
                          className="text-xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                          onDoubleClick={() => handleTypeDoubleClick(type)}
                          title={isAdmin ? "Double-click to edit" : ""}
                        >
                          {type}
                        </h3>
                      )}
                      <span className="text-foreground/60 text-sm">({typeItems.length} items)</span>
                    </div>

                    {/* Items Column - Vertical Scroll */}
                    <div
                      ref={(el) => (columnsRef.current[type] = el)}
                      className={`space-y-3 max-h-[1000px] overflow-y-auto relative ${autoScrollMap[type] === 'up' ? 'auto-scroll-up' : autoScrollMap[type] === 'down' ? 'auto-scroll-down' : ''} ${isDragging ? 'overflow-y-scroll' : ''}`}
                      onDragOver={(e) => {
                        if (!isAdmin || !draggedId) return
                        e.preventDefault()
                        e.stopPropagation()
                        setDragOverType(type)

                        // Auto-scroll column when near edges
                        const rect = e.currentTarget.getBoundingClientRect()
                        const scrollThreshold = 100
                        const scrollSpeed = 12

                        if (e.clientY - rect.top < scrollThreshold) {
                          (e.currentTarget as HTMLElement).scrollTop = Math.max(0, (e.currentTarget as HTMLElement).scrollTop - scrollSpeed)
                        } else if (rect.bottom - e.clientY < scrollThreshold) {
                          (e.currentTarget as HTMLElement).scrollTop = Math.min(
                            (e.currentTarget as HTMLElement).scrollHeight - (e.currentTarget as HTMLElement).clientHeight,
                            (e.currentTarget as HTMLElement).scrollTop + scrollSpeed
                          )
                        }

                        // Calculate drop position based on actual DOM items
                        const foundIndex = computeIndexFromContainer(e.currentTarget, e.clientY)
                        setDragOverIndex(foundIndex)
                      }}
                      onDrop={(e) => {
                        if (!isAdmin || !draggedId || dragOverType !== type) return
                        e.preventDefault()
                        e.stopPropagation()
                        const finalIndex = dragOverIndex !== null ? dragOverIndex : typeItems.length
                        handleDrop(null, type, finalIndex)
                      }}
                    >
                      {/* Drop zone at the start */}
                      {isAdmin && draggedId && dragOverType === type && dragOverIndex === 0 && (
                        <div className="h-2 bg-primary/50 rounded-lg border-2 border-dashed border-primary transition-all" />
                      )}

                      {typeItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                          {/* Drop zone before item */}
                          {isAdmin && draggedId && dragOverType === type && dragOverIndex === index && draggedId !== item.id && (
                            <div className="h-2 bg-primary/50 rounded-lg border-2 border-dashed border-primary transition-all" />
                          )}
                          <div
                            draggable={isAdmin}
                            onDragStart={(e) => {
                              if (!isAdmin) return
                              handleDragStart(item.id, type, e)
                              e.dataTransfer.effectAllowed = "move"
                            }}
                            onDragOver={(e) => {
                              if (!isAdmin || !draggedId) return
                              e.preventDefault()
                              e.stopPropagation()
                              // calculate drop index using real DOM children
                              const container = e.currentTarget.parentElement as Element
                              if (container) {
                                const calculatedIndex = computeIndexFromContainer(container, e.clientY)
                                setDragOverType(type)
                                setDragOverIndex(calculatedIndex)
                              }
                              // Determine if we are in upper or lower half for direction hint
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                              const y = e.clientY - rect.top
                              const midPoint = rect.height / 2
                              const calculatedIndex = y < midPoint ? index : index + 1
                              setDragOverIndex(calculatedIndex)
                            }}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => {
                              if (!isAdmin || !draggedId) return
                              e.preventDefault()
                              e.stopPropagation()
                              const container = e.currentTarget.parentElement as Element
                              const dropIndex = container ? computeIndexFromContainer(container, e.clientY) : index + 1
                              setDragOverType(type)
                              handleDrop(item.id, type, dropIndex)
                            }}
                            onMouseDown={(e) => {
                              if (!isAdmin || (e.target as HTMLElement).closest('button')) {
                                e.preventDefault()
                              }
                            }}
                            className={`group draggable-item glass-strong rounded-lg overflow-hidden transition-all relative ${draggedId === item.id ? "opacity-30 scale-90 rotate-2 z-50 cursor-grabbing" : isAdmin ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"} ${draggedId && draggedId !== item.id && dragOverType === type && (dragOverIndex === index || dragOverIndex === index + 1) ? "ring-2 ring-primary ring-offset-2" : ""} ${isDragging && draggedId !== item.id ? "scale-90" : ""}`}
                            style={{
                              width: "100%",
                              minHeight: isDragging ? "90px" : "120px",
                            }}
                          >
                            <div className="p-3 space-y-2">
                              {isAdmin && draggedId === item.id && dragDirection && (
                                <div className={`absolute top-2 right-2 text-2xl animate-bounce z-10 ${dragDirection === "up" ? "text-green-400" : "text-blue-400"}`}>
                                  {dragDirection === "up" ? "⬆️" : "⬇️"}
                                </div>
                              )}
                              {isAdmin && (
                                <div className="flex justify-end gap-2">
                                  <button style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingItem(item)
                                    }}
                                    className="p-1 glass text-primary hover:bg-primary/20 rounded text-xs"
                                  >
                                    {t("admin.edit")}
                                  </button>
                                  <button style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteClick(item)
                                    }}
                                    className="p-1 glass text-red-400 hover:bg-red-500/20 rounded text-xs"
                                  >
                                    {t("admin.delete")}
                                  </button>
                                </div>
                              )}
                              <div className="flex items-center gap-2" >
                                <span className="text-xs font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                  #{item.rank}
                                </span>
                              </div>

                              <div className="w-full overflow-hidden rounded" onClick={(e) => {
                                if (!draggedId && !(e.target as HTMLElement).closest('button')) {
                                  router.push(`/item/${item.id}`)
                                }
                              }}>
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl || "/placeholder.svg"}
                                    alt={item.title || `Item ${item.rank}`}
                                    className="w-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                    <span className="text-2xl">📌</span>
                                  </div>
                                )}
                              </div>
                              <h4 className="font-bold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {item.title || `Item ${item.rank}`}
                              </h4>
                              {item.description && (
                                <p className="text-foreground/60 text-xs line-clamp-2 overflow-hidden">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                      {/* Drop zone at the end */}
                      {isAdmin && draggedId && dragOverType === type && dragOverIndex === typeItems.length && (
                        <div className="h-8 bg-primary/30 rounded-lg border-4 border-dashed border-primary transition-all" />
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {!itemsLoading && typeColumns.every(type => getFilteredItemsByType(type).length === 0) && (
        <div className="text-center py-12">
          <p className="text-foreground/60 text-lg">{t("item.noItems")}</p>
        </div>
      )}

      {isAdmin && (
        <>
          <CreateItemDialog
            isOpen={isCreateItemOpen}
            categoryId={categoryId}
            categoryName={category?.name || ""}
            onClose={() => setIsCreateItemOpen(false)}
            editingItem={editingItem}
            onEditClose={() => setEditingItem(null)}
          />
          {!showConfirmDelete ? (
            <DeleteConfirmation
              isOpen={deleteTarget !== null}
              title={`${t("admin.delete")} "${deleteTarget?.title || "Item"}"?`}
              description={t("admin.deleteConfirm")}
              onConfirm={() => setShowConfirmDelete(true)}
              onCancel={() => setDeleteTarget(null)}
            />
          ) : (
            <DeleteConfirmation
              isOpen={showConfirmDelete}
              title={`${t("admin.areYouSure")}?`}
              description={t("admin.finalDelete")}
              onConfirm={handleDeleteItem}
              onCancel={() => {
                setShowConfirmDelete(false)
                setDeleteTarget(null)
              }}
              isSecondConfirm={true}
            />
          )}
        </>
      )}
    </div>
  )
}

/**
 * WatchServersButtons
 * Small component you can import and use in your item detail page to render the watch/search server buttons.
 * Use: <WatchServersButtons title={item.title} />
 */
export function WatchServersButtons({ title }: { title?: string }) {
  if (!title || title.trim() === "") return null

  const slugifyForUrl = (s: string) => {
    // return slug variations required by different sites
    // some sites accept hyphenated, some accept spaces or +, some accept urlencoded
    const hyphen = encodeURIComponent(s.trim().toLowerCase().replace(/\s+/g, "-"))
    const plus = encodeURIComponent(s.trim().replace(/\s+/g, "+"))
    const qEncoded = encodeURIComponent(s.trim())
    const hyphenRaw = s.trim().toLowerCase().replace(/\s+/g, "-")
    return { hyphen, plus, qEncoded, hyphenRaw }
  }

  const { hyphen, plus, qEncoded, hyphenRaw } = slugifyForUrl(title)

  const links = [
    { label: "MovieBox", url: `https://moviebox.ph/web/searchResult?keyword=${qEncoded}` }, // existing
    { label: "MoviesJoy", url: `https://moviesjoytv.to/search/${hyphenRaw}` },
    { label: "SFlix", url: `https://sflix.ps/search/${hyphenRaw}` },
    { label: "Flixer", url: `https://flixer.sh/search?q=${qEncoded}` },
    { label: "EgyDead", url: `https://egydead.media/?s=${plus}` },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 glass rounded-md text-sm font-medium hover:opacity-90"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}
