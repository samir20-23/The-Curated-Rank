"use client"

import type React from "react"
import { useState } from "react"
import { uploadImage } from "@/lib/supabase"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"

interface CreateCategoryDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateCategoryDialog({ isOpen, onClose }: CreateCategoryDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addCategory } = useFirebaseCategories()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !type) {
      setError("Name and type are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      let finalImageUrl = imageUrl

      // Upload image if file provided
      if (imageFile) {
        // finalImageUrl = await uploadImage(imageFile)
        // finalImageUrl = await uploadImage(imageFile, "category")
        finalImageUrl = await uploadImage(imageFile, "category", name)


      }

      await addCategory({
        name,
        type,
        image: "📌",
        imageUrl: finalImageUrl || undefined,
        createdAt: new Date(),
      })

      setName("")
      setType("")
      setImageUrl("")
      setImageFile(null)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-strong rounded-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6">Create New Category</h2>

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
            <label className="block text-sm font-medium text-foreground mb-2">Type</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Action, Romance, Drama"
              className="w-full px-4 py-2 glass rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
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
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
