"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { uploadImage } from "@/lib/supabase"
import { useFirebaseSocialPosts } from "@/hooks/use-firebase-social-posts"
import { useLanguage } from "@/contexts/language-context"
import type { SocialPost } from "@/lib/types"

interface SocialPostDialogProps {
  isOpen: boolean
  onClose: () => void
  editingPost?: SocialPost | null
}

export default function SocialPostDialog({ isOpen, onClose, editingPost }: SocialPostDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [platform, setPlatform] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addPost, updatePost } = useFirebaseSocialPosts()
  const { t } = useLanguage()

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "")
      setDescription(editingPost.description || "")
      setLink(editingPost.link || "")
      setPlatform(editingPost.platform || "")
      setImageUrl(editingPost.imageUrl || "")
      setImageFile(null)
    } else {
      setTitle("")
      setDescription("")
      setLink("")
      setPlatform("")
      setImageUrl("")
      setImageFile(null)
    }
  }, [editingPost, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImageUrl("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!link.trim()) {
      setError("Link is required")
      return
    }

    if (imageUrl && imageFile) {
      setError("Please use either image URL or upload, not both")
      return
    }

    setLoading(true)
    setError("")

    try {
      let finalImageUrl = imageUrl

      // Upload image if file provided
      if (imageFile) {
        const imageName = title?.trim() || `post-${Date.now()}`
        finalImageUrl = await uploadImage(imageFile, "socialPosts", imageName)
      }

      const payload: Omit<SocialPost, "id"> = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        link: link.trim(),
        imageUrl: finalImageUrl || undefined,
        platform: platform.trim() || undefined,
        createdAt: editingPost?.createdAt || new Date(),
      }

      if (editingPost) {
        await updatePost(editingPost.id, payload)
      } else {
        await addPost(payload)
      }

      setTitle("")
      setDescription("")
      setLink("")
      setPlatform("")
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="glass-strong rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {editingPost ? t("admin.edit") : "Add"} Social Media Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Post description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Link <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Platform (optional)
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select platform</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter/X</option>
              <option value="tiktok">TikTok</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
              disabled={!!imageFile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Upload Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!!imageUrl}
            />
            {imageFile && (
              <p className="text-sm text-foreground/60 mt-1">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : editingPost ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

