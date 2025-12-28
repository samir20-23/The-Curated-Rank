"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { uploadImage } from "@/lib/supabase"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useLanguage } from "@/contexts/language-context"
import type { Category } from "@/lib/types"

interface CreateCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  editingCategory?: Category | null
}

export default function CreateCategoryDialog({ isOpen, onClose, editingCategory }: CreateCategoryDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("") // Keep for backward compatibility
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [useTypes, setUseTypes] = useState(true) // Checkbox for using types
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addCategory, updateCategory } = useFirebaseCategories()
  const { t } = useLanguage()

  // Load editing category data
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name)
      setType(editingCategory.type || "")
      setTags(editingCategory.tags || (editingCategory.type ? editingCategory.type.split(", ").map(t => t.trim()) : []))
      setUseTypes(editingCategory.useTypes !== false) // Default to true if not set
      setImageUrl(editingCategory.imageUrl || "")
      setImageFile(null)
    } else {
      setName("")
      setType("")
      setTags([])
      setCurrentTag("")
      setUseTypes(true)
      setImageUrl("")
      setImageFile(null)
    }
  }, [editingCategory, isOpen])

  const handleAddTag = () => {
    if (currentTag.trim()) {
      // Handle comma-separated values
      const newTags = currentTag
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !tags.includes(tag))

      if (newTags.length > 0) {
        setTags([...tags, ...newTags])
        setCurrentTag("")
      }
    }
  }

  const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    // Split by comma and clean up
    const newTags = pastedText
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !tags.includes(tag))

    if (newTags.length > 0) {
      setTags([...tags, ...newTags])
      setCurrentTag("")
    } else {
      // If all tags already exist, just clear the input
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: if name is empty, force image. If name is not empty, image is optional
    if (!name && !imageUrl && !imageFile) {
      setError("Name or image is required")
      return
    }

    // If useTypes is checked, require tags
    if (useTypes && tags.length === 0 && !type) {
      setError("At least one tag is required when using types")
      return
    }

    setLoading(true)
    setError("")

    try {
      let finalImageUrl = imageUrl

      // Upload image if file provided
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, "category", name || "category")
      }

      const payload: any = {
        name,
        type: type || tags.join(", "),
        useTypes: useTypes,
        image: "📌",
        createdAt: new Date(),
      }

      if (useTypes && tags.length > 0) {
        payload.tags = tags
      }

      if (finalImageUrl) {
        payload.imageUrl = finalImageUrl
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload)
      } else {
        await addCategory(payload)
      }


      setName("")
      setType("")
      setTags([])
      setCurrentTag("")
      setImageUrl("")
      setImageFile(null)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

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
          {editingCategory ? "Edit Category" : "Create New Category"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Anime"
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={useTypes}
                onChange={(e) => setUseTypes(e.target.checked)}
                className="w-4 h-4 rounded"
                disabled={loading}
              />
              <span className="text-sm font-medium text-foreground">{t("admin.useTypes")} ({t("admin.useTypesDesc")})</span>
            </label>

            {useTypes && (
              <>
                <label className="block text-sm font-medium text-slate-200 mb-2">Tags (press Enter to add)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onPaste={handleTagPaste}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className="flex-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Add a tag (or paste comma-separated: drama, action, Documentary)"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={loading}
                    className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={loading}
                          className="hover:text-destructive transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={!!imageFile || loading}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
            <p className="text-xs text-foreground/60 mt-1">Or upload an image below</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Upload Image (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} className="w-full" />
            {imageFile && <p className="text-xs text-primary mt-2">Selected: {imageFile.name}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button" 
              onClick={onClose} 
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
              {loading ? (editingCategory ? "Saving..." : "Creating...") : (editingCategory ? "Save Changes" : "Create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
