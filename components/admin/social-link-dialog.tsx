"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFirebaseSocialLinks } from "@/hooks/use-firebase-social-links"
import { useLanguage } from "@/contexts/language-context"
import type { SocialLink } from "@/lib/types"

interface SocialLinkDialogProps {
  isOpen: boolean
  onClose: () => void
  editingLink?: SocialLink | null
}

export default function SocialLinkDialog({ isOpen, onClose, editingLink }: SocialLinkDialogProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { addLink, updateLink } = useFirebaseSocialLinks()
  const { t } = useLanguage()

  useEffect(() => {
    if (editingLink) {
      setName(editingLink.name || "")
      setUrl(editingLink.url || "")
      setIconUrl(editingLink.iconUrl || "")
    } else {
      setName("")
      setUrl("")
      setIconUrl("")
    }
  }, [editingLink, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !url.trim()) {
      setError("Name and URL are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const payload: Omit<SocialLink, "id"> = {
        name: name.trim(),
        url: url.trim(),
        iconUrl: iconUrl.trim() || undefined,
        createdAt: editingLink?.createdAt || new Date(),
      }

      if (editingLink) {
        await updateLink(editingLink.id, payload)
      } else {
        await addLink(payload)
      }

      setName("")
      setUrl("")
      setIconUrl("")
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
          {editingLink ? t("admin.edit") : "Add"} Social Media Link
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Facebook, Instagram"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icon URL (optional)
            </label>
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
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
              {loading ? "Saving..." : editingLink ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

