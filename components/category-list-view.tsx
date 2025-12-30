"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import CreateItemDialog from "@/components/admin/create-item-dialog"
import DeleteConfirmation from "@/components/admin/delete-confirmation"
import OptimizedImage from "@/components/optimized-image"
import type { Item } from "@/lib/types"
import Loading from "./loading"
import "./list.css"

interface CategoryListViewProps {
  categoryId: string
  onBack?: () => void
}

type TempItem = Item & { isTemp: true; __originalType?: string; insertPosition?: number }

export default function CategoryListView({ categoryId }: CategoryListViewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const { isAdmin } = useAuth()

  const { items, loading: itemsLoading, updateRanks, updateItem, deleteItem } = useFirebaseItems(categoryId)
  const { categories, updateCategory } = useFirebaseCategories()
  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId])

  const [filterText, setFilterText] = useState("")
  const [filterType, setFilterType] = useState<string>("")
  const [filterRank, setFilterRank] = useState<string>("")
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editingTypeValue, setEditingTypeValue] = useState("")
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [draggedType, setDraggedType] = useState<string | null>(null)
  const [dragDirection, setDragDirection] = useState<"up" | "down" | null>(null)
  const [dragOverType, setDragOverType] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const [tempItems, setTempItems] = useState<TempItem[]>([])

  const columnsRef = useRef<Record<string, HTMLDivElement | null>>({})
  const autoIntervalsRef = useRef<Record<string, number | null>>({})
  const autoDirRef = useRef<Record<string, number>>({})

  const useTypes = category?.useTypes !== false

  const availableTypes = useMemo(() => {
    if (!useTypes) return []
    if (category?.tags && category.tags.length > 0) return category.tags
    if (category?.type) return category.type.split(",").map((s) => s.trim()).filter(Boolean)
    return []
  }, [category?.tags, category?.type, useTypes])

  const getServerItemsForType = useCallback(
    (type?: string) => {
      if (!type) {
        return items.filter((i) => !i.type).sort((a, b) => a.rank - b.rank)
      }
      return items.filter((i) => i.type === type).sort((a, b) => a.rank - b.rank)
    },
    [items],
  )

  const getServerAll = useCallback(() => items.slice().sort((a, b) => a.rank - b.rank), [items])

  const mergeServerAndTempsForType = useCallback(
    (type?: string) => {
      const server = getServerItemsForType(type)
      const temps = tempItems.filter((t) => (t.type || "") === (type || ""))
      const result: Item[] = []
      for (let i = 0; i < server.length; i++) {
        const before = temps.filter((tt) => (tt.insertPosition ?? server.length) === i)
        result.push(...before)
        result.push(server[i])
      }
      const endTemps = temps.filter((tt) => (tt.insertPosition ?? server.length) >= server.length)
      result.push(...endTemps)
      return result
    },
    [getServerItemsForType, tempItems],
  )

  const itemsByType = useMemo(() => {
    if (!useTypes || availableTypes.length === 0) return {}
    return availableTypes.reduce((acc: Record<string, Item[]>, type) => {
      const merged = mergeServerAndTempsForType(type)
      if (merged.length > 0) acc[type] = merged
      return acc
    }, {})
  }, [availableTypes, mergeServerAndTempsForType, useTypes])

  const isListMode = useMemo(() => {
    if (!useTypes) return true
    if (availableTypes.length === 0) return true
    if (availableTypes.length === 1) return true
    return Object.keys(itemsByType).length <= 1
  }, [availableTypes.length, itemsByType, useTypes])

  const mergedNoType = useMemo(() => mergeServerAndTempsForType(undefined), [mergeServerAndTempsForType])

  const filterTimeoutRef = useRef<number | null>(null)
  const [debouncedFilterText, setDebouncedFilterText] = useState(filterText)
  useEffect(() => {
    if (filterTimeoutRef.current) window.clearTimeout(filterTimeoutRef.current)
    filterTimeoutRef.current = window.setTimeout(() => {
      setDebouncedFilterText(filterText)
    }, 220)
    return () => {
      if (filterTimeoutRef.current) window.clearTimeout(filterTimeoutRef.current)
    }
  }, [filterText])

  const filteredItems = useMemo(() => {
    return mergedNoType.filter((item) => {
      const matchesText =
        !debouncedFilterText ||
        (item.title || "").toLowerCase().includes(debouncedFilterText.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(debouncedFilterText.toLowerCase())
      const matchesType = !filterType || item.type === filterType
      const matchesRank =
        !filterRank ||
        (item.rank !== undefined && item.rank.toString() === filterRank) ||
        (item.rank !== undefined && item.rank.toString().includes(filterRank))
      return matchesText && matchesType && matchesRank
    })
  }, [debouncedFilterText, filterRank, filterType, mergedNoType])

  const computeIndexFromContainer = (container: Element, clientY: number) => {
    const children = Array.from(container.querySelectorAll<HTMLElement>(".draggable-item"))
    if (children.length === 0) return 0
    const rect = container.getBoundingClientRect()
    const scrollTop = (container as HTMLElement).scrollTop || 0
    const mouseY = clientY - rect.top + scrollTop
    let currentTop = 0
    for (let i = 0; i < children.length; i++) {
      const ch = children[i]
      const h = ch.offsetHeight
      const mid = currentTop + h / 2
      if (mouseY < mid) return i
      currentTop += h
    }
    return children.length
  }

  const lastDragOverTsRef = useRef(0)
  const throttleDragOver = (fn: () => void) => {
    const now = Date.now()
    if (now - lastDragOverTsRef.current > 40) {
      lastDragOverTsRef.current = now
      fn()
    }
  }

  const resetDragState = useCallback(() => {
    setDraggedId(null)
    setDraggedType(null)
    setDragOverType(null)
    setDragOverIndex(null)
    setDragDirection(null)
    setIsDragging(false)
  }, [])

  const handleDragStart = useCallback((itemId: string, type?: string, e?: React.DragEvent) => {
    if (!isAdmin) return
    setDraggedId(itemId)
    setDraggedType(type || null)
    setDragDirection(null)
    setDragOverType(null)
    setDragOverIndex(null)
    setIsDragging(true)
    if (e) {
      const img = new Image()
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
      try {
        e.dataTransfer.setDragImage(img, 0, 0)
        e.dataTransfer.effectAllowed = "move"
      } catch { }
    }
  }, [isAdmin])

  const handleDragEnd = useCallback(() => {
    resetDragState()
  }, [resetDragState])

  const visualIndexToServerIndex = (mergedList: Item[], visualIndex: number) => {
    let count = 0
    for (let i = 0; i < visualIndex && i < mergedList.length; i++) {
      const it = mergedList[i] as any
      if (!it.isTemp) count++
    }
    return count
  }

  const handleDrop = useCallback(
    async (targetId: string | null, type?: string, dropIndex?: number) => {
      if (!isAdmin || !draggedId) {
        resetDragState()
        return
      }
      const isTemp = draggedId.startsWith("dup-")
      try {
        if (isTemp) {
          setTempItems((prev) => {
            const tmp = prev.find((p) => p.id === draggedId)
            if (!tmp) return prev
            const newPrev = prev.filter((p) => p.id !== draggedId)
            const targetType = type || undefined
            const serverList = getServerItemsForType(targetType)
            const existingTemps = newPrev.filter((x) => (x.type || "") === (targetType || ""))
            const insertPos =
              typeof dropIndex === "number"
                ? Math.max(0, Math.min(dropIndex, serverList.length + existingTemps.length))
                : serverList.length
            const moved: TempItem = { ...tmp, type: targetType, insertPosition: insertPos }
            return [...newPrev, moved]
          })
          setIsDuplicating(false)
          resetDragState()
          return
        }

        if (useTypes && type) {
          const sourceType = draggedType || undefined
          const targetType = type || undefined
          const sourceServer = getServerItemsForType(sourceType)
          const targetServer = getServerItemsForType(targetType)
          const mergedTarget = mergeServerAndTempsForType(targetType)
          const sourceIndex = sourceServer.findIndex((i) => i.id === draggedId)
          if (sourceIndex === -1) {
            resetDragState()
            return
          }

          let serverTargetIndex: number
          if (typeof dropIndex === "number") {
            serverTargetIndex = visualIndexToServerIndex(mergedTarget, dropIndex)
          } else if (targetId) {
            const visualIdx = mergedTarget.findIndex((i) => i.id === targetId)
            const vi = visualIdx === -1 ? mergedTarget.length : visualIdx
            serverTargetIndex = visualIndexToServerIndex(mergedTarget, vi)
          } else {
            serverTargetIndex = targetServer.length
          }

          serverTargetIndex = Math.max(0, Math.min(serverTargetIndex, targetServer.length))

          if (sourceType === targetType) {
            const reorderedItems = [...targetServer]
            const [draggedItem] = reorderedItems.splice(sourceIndex, 1)
            const adjustedTargetIndex = sourceIndex < serverTargetIndex ? serverTargetIndex - 1 : serverTargetIndex
            reorderedItems.splice(adjustedTargetIndex, 0, draggedItem)
            const updates = reorderedItems.map((item, idx) => ({ ...item, rank: idx + 1, type: targetType }))
            await updateRanks(updates)
          } else {
            const newSource = [...sourceServer]
            const [draggedItem] = newSource.splice(sourceIndex, 1)
            const newTarget = [...targetServer]
            newTarget.splice(serverTargetIndex, 0, draggedItem)
            const sourceUpdates = newSource.map((item, idx) => ({ ...item, rank: idx + 1 }))
            const targetUpdates = newTarget.map((item, idx) => ({ ...item, rank: idx + 1, type: targetType }))
            await updateItem(draggedId, { type: targetType || undefined })
            await updateRanks([...sourceUpdates, ...targetUpdates])
          }
        } else {
          const serverAll = getServerAll()
          const mergedAll = mergeServerAndTempsForType(undefined)
          const sourceIndex = serverAll.findIndex((i) => i.id === draggedId)
          if (sourceIndex === -1) {
            resetDragState()
            return
          }
          let serverTargetIndex: number
          if (typeof dropIndex === "number") {
            serverTargetIndex = visualIndexToServerIndex(mergedAll, dropIndex)
          } else if (targetId) {
            const visualIdx = mergedAll.findIndex((i) => i.id === targetId)
            const vi = visualIdx === -1 ? mergedAll.length : visualIdx
            serverTargetIndex = visualIndexToServerIndex(mergedAll, vi)
          } else {
            serverTargetIndex = serverAll.length
          }

          serverTargetIndex = Math.max(0, Math.min(serverTargetIndex, serverAll.length))
          const newItems = [...serverAll]
          const [draggedItem] = newItems.splice(sourceIndex, 1)
          if (sourceIndex < serverTargetIndex) serverTargetIndex -= 1
          newItems.splice(serverTargetIndex, 0, draggedItem)
          const itemsToReorder = newItems.map((item, idx) => ({ ...item, rank: idx + 1 }))
          await updateRanks(itemsToReorder)
        }
      } catch (err) {
        console.error("drop error:", err)
      } finally {
        resetDragState()
      }
    },
    [draggedId, draggedType, getServerAll, getServerItemsForType, isAdmin, mergeServerAndTempsForType, resetDragState, updateItem, updateRanks, useTypes],
  )

  const handleTypeDoubleClick = useCallback((type: string) => {
    if (!isAdmin) return
    const typeItems = getServerItemsForType(type)
    if (typeItems.length > 0) {
      setEditingType(type)
      setEditingTypeValue(type)
    }
  }, [getServerItemsForType, isAdmin])

  const handleTypeSave = useCallback(async () => {
    if (!editingType || !category) return
    const oldType = editingType
    const newType = editingTypeValue.trim()
    if (!newType) {
      const typeItems = getServerItemsForType(oldType)
      if (typeItems.length > 0) {
        alert("Cannot delete type that has items. Please remove items first.")
        setEditingType(null)
        setEditingTypeValue("")
        return
      }
    }
    if (newType && newType !== oldType) {
      const updatedTags = availableTypes.map((t) => (t === oldType ? newType : t))
      await updateCategory(categoryId, {
        tags: updatedTags,
        type: updatedTags.join(", "),
      })
      const itemsToUpdate = items.filter((item) => item.type === oldType)
      for (const item of itemsToUpdate) {
        await updateItem(item.id, { type: newType })
      }
    }
    setEditingType(null)
    setEditingTypeValue("")
  }, [availableTypes, category, categoryId, editingType, editingTypeValue, items, updateCategory, updateItem, getServerItemsForType])

  const handleTypeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTypeSave()
    else if (e.key === "Escape") {
      setEditingType(null)
      setEditingTypeValue("")
    }
  }, [handleTypeSave])

  const handleDeleteItem = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget.id)
      setDeleteTarget(null)
      setShowConfirmDelete(false)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }, [deleteItem, deleteTarget])

  const handleDeleteClick = useCallback((item: Item) => {
    setDeleteTarget(item)
    setShowConfirmDelete(false)
  }, [])

  const handleDuplicateClick = useCallback((item: Item) => {
    if (!isAdmin) return
    const tmpId = `dup-${Date.now()}`
    const serverList = getServerItemsForType(item.type)
    const tmp: TempItem = {
      ...(item as Item),
      id: tmpId,
      isTemp: true,
      __originalType: item.type,
      type: item.type,
      insertPosition: serverList.length,
    }
    setTempItems((prev) => [...prev, tmp])
    setIsDuplicating(true)
    setDraggedId(tmpId)
    setDraggedType(item.type || null)
    setIsDragging(true)
    setTimeout(() => {
      const el = document.querySelector(`.draggable-item[data-id="${tmpId}"]`) as HTMLElement | null
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }, [getServerItemsForType, isAdmin])

  const itemMinHeight = 72
  const imageSize = 160
  const cardHeight = 200

  const renderItemCard = useCallback((item: Item, type?: string, indexInMerged?: number, listMode: boolean = false) => {
    const isTemp = (item as any).isTemp

    if (listMode) {
      return (
        <div
          key={item.id}
          data-id={item.id}
          draggable={isAdmin}
          className={`group draggable-item glass-strong rounded-lg overflow-hidden transition-all relative flex gap-4 items-stretch`}
          style={{
            width: "100%",
            minHeight: `${cardHeight}px`,
            opacity: isDuplicating && !isTemp ? 0.6 : 1,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          onDragStart={(e) => {
            if (!isAdmin) return
            handleDragStart(item.id, type, e)
            try {
              e.dataTransfer.effectAllowed = "move"
            } catch { }
          }}
          onDragOver={(e) => {
            if (!isAdmin || !draggedId || draggedId === item.id) return
            e.preventDefault()
            e.stopPropagation()
            if (type !== undefined) setDragOverType(type)
            else setDragOverType(null)
            const container = e.currentTarget.parentElement as Element | null
            if (container) {
              throttleDragOver(() => {
                const calculatedIndex = computeIndexFromContainer(container, e.clientY)
                setDragOverIndex(calculatedIndex)
              })
            }
          }}
          onDrop={(e) => {
            if (!isAdmin || !draggedId || draggedId === item.id) return
            e.preventDefault()
            e.stopPropagation()
            const container = e.currentTarget.parentElement as Element | null
            let dropIndex: number | undefined
            if (container) dropIndex = computeIndexFromContainer(container, e.clientY)
            handleDrop(item.id, type, dropIndex)
          }}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            if (!draggedId && !(e.target as HTMLElement).closest("button")) {
              router.push(`/item/${item.id}`)
            }
          }}
          role="article"
          aria-label={item.title || "Item"}
        >
          <div
            className="flex-shrink-0 rounded overflow-hidden"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              margin: "16px",
              background: "rgba(0,0,0,0.04)",
            }}
            onClick={(e) => {
              if (!draggedId && !(e.target as HTMLElement).closest("button")) {
                router.push(`/item/${item.id}`)
              }
            }}
          >
            {item.imageUrl ? (
              <OptimizedImage
                src={item.imageUrl}
                alt={item.title || `Item ${item.rank}`}
                width={imageSize}
                height={imageSize}
                className="w-full h-full object-cover"
                style={{ objectFit: "cover", width: `${imageSize}px`, height: `${imageSize}px` }}
              />
            ) : (
              " "
            )}
          </div>

          <div className="flex-1 pr-4 py-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-base truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-foreground/70 mt-2 text-sm line-clamp-3">{item.description}</p>
                  )}
                  {item.type && (
                    <div className="mt-3">
                      <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/12">
                        {item.type}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-foreground/60 ml-2" aria-hidden>
                  #{item.rank ?? (item as any).insertPosition ?? "-"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="text-sm text-foreground/60">{isTemp ? t("item.temp") ?? "Temp" : ""}</div>

              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingItem(item)
                    }}
                    className="p-1 glass text-primary hover:bg-primary/20 rounded text-xs"
                    aria-label={t("admin.edit") ?? "Edit"}
                  >
                    {t("admin.edit")}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(item)
                    }}
                    className="p-1 glass text-red-400 hover:bg-red-500/20 rounded text-xs"
                    aria-label={t("admin.delete") ?? "Delete"}
                  >
                    {t("admin.delete")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={item.id}
        data-id={item.id}
        draggable={isAdmin}
        className={`group draggable-item glass-strong rounded-lg overflow-hidden transition-all relative ${draggedId === item.id ? "opacity-30 scale-95 z-50" : isAdmin ? "cursor-grab" : "cursor-pointer"}`}
        style={{
          width: "100%",
          minHeight: `${itemMinHeight}px`,
          opacity: isDuplicating && !isTemp ? 0.5 : 1,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onDragStart={(e) => {
          if (!isAdmin) return
          handleDragStart(item.id, type, e)
          try {
            e.dataTransfer.effectAllowed = "move"
          } catch { }
        }}
        onDragOver={(e) => {
          if (!isAdmin || !draggedId || draggedId === item.id) return
          e.preventDefault()
          e.stopPropagation()
          if (type !== undefined) setDragOverType(type)
          else setDragOverType(null)
          const rect = e.currentTarget.getBoundingClientRect()
          const y = e.clientY - rect.top
          const midPoint = rect.height / 2
          const calculatedIndex = indexInMerged !== undefined ? (y < midPoint ? indexInMerged : indexInMerged + 1) : 0
          throttleDragOver(() => setDragOverIndex(calculatedIndex))
        }}
        onDrop={(e) => {
          if (!isAdmin || !draggedId || draggedId === item.id) return
          e.preventDefault()
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          const y = e.clientY - rect.top
          const midPoint = rect.height / 2
          let dropIndex: number | undefined
          if (indexInMerged !== undefined) {
            dropIndex = y < midPoint ? indexInMerged : indexInMerged + 1
          } else if (dragOverIndex !== null) {
            dropIndex = dragOverIndex
          }
          handleDrop(item.id, type, dropIndex)
        }}
        onDragEnd={handleDragEnd}
        onClick={(e) => {
          if (!draggedId && !(e.target as HTMLElement).closest("button")) {
            router.push(`/item/${item.id}`)
          }
        }}
        role="article"
        aria-label={item.title || "Item"}
      >
        <div className="p-3 space-y-2">
          {isAdmin && draggedId === item.id && dragDirection && (
            <div className={`absolute top-2 right-2 text-base animate-bounce z-10 ${dragDirection === "up" ? "text-green-400" : "text-blue-400"}`}>
              {dragDirection === "up" ? "⬆️" : "⬇️"}
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-end gap-2 relative z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingItem(item)
                }}
                className="p-1 glass text-primary hover:bg-primary/20 rounded text-xs"
              >
                {t("admin.edit")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(item)
                }}
                className="p-1 glass text-red-400 hover:bg-red-500/20 rounded text-xs"
              >
                {t("admin.delete")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDuplicateClick(item)
                }}
                className="p-1 glass text-foreground hover:bg-secondary/20 rounded text-xs"
              >
                Dup
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">#{item.rank ?? (item as any).insertPosition ?? "-"}</span>

          </div>

          <div className=" overflow-hidden rounded relative" style={{ pointerEvents: "none", minHeight: "100px" }} onClick={() => router.push(`/item/${item.id}`)}>
            {item.imageUrl ? (
              <OptimizedImage
                src={item.imageUrl}
                alt={item.title || `Item ${item.rank}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
                style={{ pointerEvents: "none", objectFit: "cover" }}

              />
            ) : (
              " "
            )}
          </div>

          <h4 className="font-bold text-foreground text-[10px] line-clamp-1">{item.title}</h4>
          {item.description && <p className="text-foreground/60 text-[9px] line-clamp-1 overflow-hidden">{item.description}</p>}
        </div>
      </div>
    )
  }, [
    cardHeight,
    computeIndexFromContainer,
    dragOverIndex,
    draggedId,
    handleDeleteClick,
    handleDragEnd,
    handleDragStart,
    handleDrop,
    handleDuplicateClick,
    imageSize,
    isAdmin,
    isDuplicating,
    router,
    t,
    throttleDragOver,
  ])

  if (isListMode) {
    return (
      <div className="space-y-6">
        {isDuplicating && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, pointerEvents: "none" }} />
        )}

        <div className="flex items-center justify-between " style={{ padding: "20px 40px 0px 40px" }}>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/")}
              className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-1xl md:text-2xl font-bold text-foreground">{category?.name}</h2>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setIsCreateItemOpen(true)} className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition">
              {t("admin.createItem")}
            </button>
          )}
        </div>

        <div className="glass-strong rounded-xl p-4 space-y-3" style={{ margin: "10px 20px 12px 20px" }}>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder={t("item.search")}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 min-w-[200px] bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none border border-border/50 rounded-lg px-3 py-2"
            />
            {useTypes && availableTypes.length > 1 && (
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

        {itemsLoading ? (
          <div className="text-center py-12">
            <div className="text-foreground/60"><Loading /></div>
          </div>
        ) : (
          <div className="space-y-4 px-4" style={{ overflowY: "auto" }}>
            <div
              onDragOver={(e) => {
                if (!isAdmin || !draggedId) return
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {filteredItems.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {isAdmin &&
                    draggedId &&
                    dragOverType === null &&
                    dragOverIndex === idx &&
                    draggedId !== item.id && (
                      <div className="h-2 bg-primary/50 rounded-lg border-2 border-dashed border-primary transition-all my-1" />
                    )}
                  <div
                    data-id={item.id}
                    onDragOver={(e) => {
                      if (!isAdmin || !draggedId) return
                      e.preventDefault()
                      e.stopPropagation()
                      setDragOverType(null)
                      const container = e.currentTarget.parentElement as Element
                      if (container) {
                        throttleDragOver(() => {
                          const calculatedIndex = computeIndexFromContainer(container, e.clientY)
                          setDragOverIndex(calculatedIndex)
                        })
                      }
                    }}
                    onDrop={(e) => {
                      if (!isAdmin || !draggedId) return
                      e.preventDefault()
                      e.stopPropagation()
                      const finalIndex = dragOverIndex !== null ? dragOverIndex : filteredItems.length
                      handleDrop(null, undefined, finalIndex)
                    }}
                  >
                    {renderItemCard(item, undefined, undefined, true)}
                  </div>
                </React.Fragment>
              ))}
              {isAdmin && draggedId && dragOverType === null && dragOverIndex === filteredItems.length && (
                <div className="h-8 bg-primary/30 rounded-lg border-4 border-dashed border-primary transition-all" />
              )}
            </div>
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

  const typeColumns = Object.keys(itemsByType)
  const isSingleType = typeColumns.length === 1

  return (
    <div className="space-y-6">
      {isDuplicating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, pointerEvents: "none" }} />
      )}

      <div className="flex items-center justify-between mb-8" style={{ padding: "20px 40px 0px 40px" }}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/")}
            className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-1xl md:text-2xl font-bold text-foreground">{category?.name}</h2>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setIsCreateItemOpen(true)} className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition">
            {t("admin.createItem")}
          </button>
        )}
      </div>

      <div className="glass-strong rounded-xl p-4 space-y-3" style={{ margin: "10px 20px 12px 20px" }}>
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
        <div className={`${isSingleType ? "" : "overflow-x-auto"} pb-4`} style={{ width: "100%", paddingLeft: 8 }}>
          <div className={`flex gap-6 ${isSingleType ? "justify-center" : ""}`} style={{ minWidth: isSingleType ? "auto" : "max-content" }}>
            {typeColumns
              .filter((type) => !filterType || type === filterType)
              .map((type) => {
                const merged = mergeServerAndTempsForType(type)
                if (merged.length === 0 && (filterText || filterRank || filterType)) return null

                return (
                  <div
                    key={type}
                    className={`${isSingleType ? "w-full max-w-4xl" : "flex-shrink-0 w-64"} space-y-4`}
                    style={{ minWidth: isSingleType ? "auto" : "210px", width: isSingleType ? "100%" : "210px" }}
                  >
                    <div className="sticky top-0 z-10 bg-transparent p-2 rounded-md text-center">
                      {editingType === type ? (
                        <input
                          type="text"
                          value={editingTypeValue}
                          onChange={(e) => setEditingTypeValue(e.target.value)}
                          onBlur={handleTypeSave}
                          onKeyDown={handleTypeKeyDown}
                          className="text-sm font-bold bg-transparent border-b-2 border-primary focus:outline-none w-full px-1"
                          autoFocus
                        />
                      ) : (
                        <h3
                          className="font-bold cursor-pointer"
                          onDoubleClick={() => handleTypeDoubleClick(type)}
                          title={isAdmin ? "Double-click to edit" : ""}
                          style={{ fontSize: "13px", textAlign: "center" }}
                        >
                          {type}
                        </h3>
                      )}
                      <span className="text-xs text-foreground/60">({merged.length})</span>
                    </div>

                    <div
                      ref={(el) => {
                        columnsRef.current[type] = el || null
                      }}
                      className={`space-y-3 max-h-[2000px] overflow-y-auto relative`}
                      style={{
                        WebkitOverflowScrolling: "touch",
                      }}
                      onMouseEnter={() => {
                        const container = columnsRef.current[type]
                        if (container) container.scrollTop = 0
                      }}
                      onDragOver={(e) => {
                        if (!isAdmin || !draggedId) return
                        e.preventDefault()
                        e.stopPropagation()
                        setDragOverType(type)
                        const rect = e.currentTarget.getBoundingClientRect()
                        const scrollThreshold = 80
                        const scrollSpeed = 12
                        if (e.clientY - rect.top < scrollThreshold) {
                          ; (e.currentTarget as HTMLElement).scrollTop = Math.max(0, (e.currentTarget as HTMLElement).scrollTop - scrollSpeed)
                        } else if (rect.bottom - e.clientY < scrollThreshold) {
                          ; (e.currentTarget as HTMLElement).scrollTop = Math.min((e.currentTarget as HTMLElement).scrollHeight - (e.currentTarget as HTMLElement).clientHeight, (e.currentTarget as HTMLElement).scrollTop + scrollSpeed)
                        }
                        const foundIndex = computeIndexFromContainer(e.currentTarget, e.clientY)
                        throttleDragOver(() => setDragOverIndex(foundIndex))
                      }}
                      onDrop={(e) => {
                        if (!isAdmin || !draggedId || dragOverType !== type) return
                        e.preventDefault()
                        e.stopPropagation()
                        const finalIndex = dragOverIndex !== null ? dragOverIndex : merged.length
                        handleDrop(null, type, finalIndex)
                      }}
                    >
                      {isAdmin && draggedId && dragOverType === type && dragOverIndex === 0 && (
                        <div className="h-2 bg-primary/50 rounded-lg border-2 border-dashed border-primary transition-all" />
                      )}

                      {merged.map((item, idx) => {
                        const showZone = isAdmin && draggedId && dragOverType === type && dragOverIndex === idx + 1 && draggedId !== item.id
                        return (
                          <React.Fragment key={item.id}>
                            <div data-id={item.id}>{renderItemCard(item, type, idx, false)}</div>
                            {showZone && <div className="h-2 bg-primary/50 rounded-lg border-2 border-dashed border-primary transition-all" />}
                          </React.Fragment>
                        )
                      })}

                      {isAdmin && draggedId && dragOverType === type && dragOverIndex === merged.length && (
                        <div className="h-8 bg-primary/30 rounded-lg border-4 border-dashed border-primary transition-all" />
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {!itemsLoading && typeColumns.every((type) => mergeServerAndTempsForType(type).length === 0) && (
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

export function WatchServersButtons({ title }: { title?: string }) {
  if (!title || title.trim() === "") return null

  const slugifyForUrl = (s: string) => {
    const hyphenRaw = s.trim().toLowerCase().replace(/\s+/g, "-")
    const plus = encodeURIComponent(s.trim().replace(/\s+/g, "+"))
    const qEncoded = encodeURIComponent(s.trim())
    return { hyphenRaw, plus, qEncoded }
  }

  const { hyphenRaw, plus, qEncoded } = slugifyForUrl(title)

  const links = [
    { label: "MovieBox", url: `https://moviebox.ph/web/searchResult?keyword=${qEncoded}` },
    { label: "MoviesJoy", url: `https://moviesjoytv.to/search/${hyphenRaw}` },
    { label: "SFlix", url: `https://sflix.ps/search/${hyphenRaw}` },
    { label: "Flixer", url: `https://flixer.sh/search?q=${qEncoded}` },
    { label: "EgyDead", url: `https://egydead.media/?s=${plus}` },
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {links.map((l) => (
        <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 glass rounded-md text-sm font-medium hover:opacity-90">
          {l.label}
        </a>
      ))}
    </div>
  )
}
