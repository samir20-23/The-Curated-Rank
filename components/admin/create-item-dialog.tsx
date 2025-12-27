"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { uploadImage } from "@/lib/supabase"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useLanguage } from "@/contexts/language-context"
import type { Item } from "@/lib/types"

interface CreateItemDialogProps {
  isOpen: boolean
  categoryId: string
  categoryName: string
  onClose: () => void
  editingItem?: Item | null
  onEditClose?: () => void
}

export default function CreateItemDialog({
  isOpen,
  categoryId,
  categoryName,
  onClose,
  editingItem,
  onEditClose,
}: CreateItemDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [newType, setNewType] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addItem, updateItem, items } = useFirebaseItems(categoryId)
  const { categories, updateCategory } = useFirebaseCategories()
  const { t } = useLanguage()

  const category = categories.find(c => c.id === categoryId)
  const availableTags = category?.tags || (category?.type ? category.type.split(", ").map(t => t.trim()) : [])

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "")
      setDescription(editingItem.description || "")
      setType(editingItem.type || "")
      setImageUrl(editingItem.imageUrl || "")
      setImageFile(null)
    } else {
      setTitle("")
      setDescription("")
      setType("")
      setNewType("")
      setImageUrl("")
      setImageFile(null)
    }
  }, [editingItem, categoryId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Image is required - either URL or upload, but not both
    if (imageUrl && imageFile) {
      setError("Please use either image URL or upload, not both")
      return
    }

    if (!imageUrl && !imageFile) {
      setError("Image is required (URL or upload)")
      return
    }

    setLoading(true)
    setError("")

    try {
      let finalImageUrl = imageUrl

      // Upload image if file provided
      if (imageFile) {
        // If name is empty, don't use it for image name
        const imageName = title?.trim() || `item-${Date.now()}`
        finalImageUrl = await uploadImage(imageFile, "items", imageName)
      }

      // Determine final type: prioritize newType if provided, otherwise use selected type
      const finalType = newType.trim() || type

      // If category has types, require selecting/creating one
      if ((availableTags.length > 0) && !finalType) {
        setError("Please select a type or create a new one.")
        setLoading(false)
        return
      }

      // If new type is provided and not in available tags, add it to category tags
      if (newType.trim() && category && !availableTags.includes(newType.trim())) {
        const updatedTags = [...availableTags, newType.trim()]
        await updateCategory(categoryId, {
          tags: updatedTags,
          type: category.type || updatedTags.join(", "), // Update type for backward compatibility
        })
      }

      // If name is empty, don't save name/description
      const itemTitle = title?.trim() || undefined
      const itemDescription = description?.trim() || undefined

      // Save item with final type
      if (editingItem) {
        await updateItem(editingItem.id, {
          ...(itemTitle !== undefined && { title: itemTitle }),
          ...(itemDescription !== undefined && { description: itemDescription }),
          type: finalType || undefined,
          imageUrl: finalImageUrl || undefined,
        })
      } else {
        // Compute rank within the selected type (row)
        const sameType = finalType ? items.filter(i => i.type === finalType) : items.filter(i => !i.type)
        const maxRank = sameType.length > 0 ? Math.max(...sameType.map(i => i.rank)) + 1 : 1
        await addItem({
          categoryId,
          ...(itemTitle && { title: itemTitle }),
          ...(itemDescription && { description: itemDescription }),
          type: finalType || undefined,
          image: "📌",
          imageUrl: finalImageUrl || undefined,
          rank: maxRank,
          createdAt: new Date(),
        })
      }

      setTitle("")
      setDescription("")
      setType("")
      setNewType("")
      setImageUrl("")
      setImageFile(null)
      if (editingItem) {
        onEditClose?.()
      } else {
        onClose()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
      onEditClose?.()
    }
  }

  if (!isOpen && !editingItem) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="glass-strong rounded-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {editingItem ? "Edit Item" : `Add to ${categoryName}`}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title <span className="text-foreground/60 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={title ?? ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Interstellar"
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-foreground/60 text-xs">(Optional)</span>
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item..."
              rows={4}
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Type <span className="text-destructive">*</span>
            </label>
            {availableTags.length > 0 ? (
              <select
                value={type ?? ""}
                onChange={(e) => {
                  setType(e.target.value)
                  if (e.target.value) {
                    setNewType("") // Clear new type when selecting from dropdown
                  }
                }}
                className="w-full px-4 py-2 glass rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              >
                <option value="">Select a type</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-foreground/60 text-sm mb-2">No types available in this category. Add types to the category first.</p>
            )}
            <div className="mt-2">
              <label className="block text-sm font-medium text-foreground/60 mb-2">Or create new type</label>
              <input
                type="text"
                value={newType}
                onChange={(e) => {
                  setNewType(e.target.value)
                  if (e.target.value.trim()) {
                    setType("") // Clear selected type when typing new type
                  }
                }}
                placeholder="Enter new type name"
                className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={loading}
              />
              <p className="text-xs text-foreground/60 mt-1">This will be added to the category tags</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image URL <span className="text-destructive">*</span> <span className="text-foreground/60 text-xs">(or upload below)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!!imageFile || loading}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <img src={imageUrl || " "} alt=" " className="w-10 h-10 right-0 absolute hover:w-30 hover:h-30 hover:z-50 hover:border-none hover:cursor-pointer hover:bg-white/50 hover:backdrop-blur-sm m-2 object-cover border rounded-lg" style={{ objectFit: "cover" }} />

            <p className="text-xs text-foreground/60 mt-1">Or upload an image below</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Image <span className="text-destructive">*</span>
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} className="w-full" style={{ border: "1px solid #ccc", borderRadius: "5px" }} />
            {imageFile && <p className="text-xs text-primary mt-2"  >Selected: {imageFile.name}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose()
                onEditClose?.()
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg font-medium transition duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition duration-300 disabled:opacity-50"
            >
              {loading ? (editingItem ? "Saving..." : "Adding...") : editingItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
