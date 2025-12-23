"use client"

import type React from "react"

import { useState } from "react"
import type { ListItem } from "@/lib/types"

interface ItemModalProps {
  isOpen: boolean
  item?: ListItem | null
  listId: string
  onClose: () => void
  onSave: (data: Omit<ListItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function ItemModal({ isOpen, item, listId, onClose, onSave }: ItemModalProps) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    year: item?.year?.toString() || "",
    runtime: item?.runtime || "",
    director: item?.director || "",
    cast: item?.cast?.join(", ") || "",
    description: item?.description || "",
    coverImage: item?.coverImage || "",
    imdbRating: item?.imdbRating?.toString() || "",
    imdbStarsText: item?.imdbStarsText || "",
    tags: item?.tags || ([] as string[]),
  })

  const [currentTag, setCurrentTag] = useState("")
  const [currentLink, setCurrentLink] = useState({ name: "", url: "" })
  const [links, setLinks] = useState(item?.externalLinks || ([] as { name: string; url: string }[]))
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleAddLink = () => {
    if (currentLink.name.trim() && currentLink.url.trim()) {
      setLinks([...links, currentLink])
      setCurrentLink({ name: "", url: "" })
    }
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const itemData: Omit<ListItem, "id" | "createdAt" | "updatedAt"> = {
        listId,
        title: formData.title,
        year: formData.year ? Number.parseInt(formData.year) : undefined,
        runtime: formData.runtime || undefined,
        director: formData.director || undefined,
        cast: formData.cast ? formData.cast.split(",").map((c) => c.trim()) : undefined,
        description: formData.description,
        coverImage: formData.coverImage,
        imdbRating: formData.imdbRating ? Number.parseFloat(formData.imdbRating) : undefined,
        imdbStarsText: formData.imdbStarsText || undefined,
        tags: formData.tags,
        externalLinks: links.length > 0 ? links : undefined,
        position: item?.position || 0,
      }

      await onSave(itemData)

      setFormData({
        title: "",
        year: "",
        runtime: "",
        director: "",
        cast: "",
        description: "",
        coverImage: "",
        imdbRating: "",
        imdbStarsText: "",
        tags: [],
      })
      setLinks([])
      onClose()
    } catch (error) {
      console.error("Error saving item:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-lg w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">{item ? "Edit Item" : "Create Item"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="e.g., The Shawshank Redemption"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="1994"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Runtime</label>
              <input
                type="text"
                value={formData.runtime}
                onChange={(e) => setFormData((prev) => ({ ...prev, runtime: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="142 min"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Director</label>
            <input
              type="text"
              value={formData.director}
              onChange={(e) => setFormData((prev) => ({ ...prev, director: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Frank Darabont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Cast (comma separated)</label>
            <input
              type="text"
              value={formData.cast}
              onChange={(e) => setFormData((prev) => ({ ...prev, cast: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Tim Robbins, Morgan Freeman"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              placeholder="Item description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="https://..."
            />
            {formData.coverImage && (
              <img
                src={formData.coverImage || "/placeholder.svg"}
                alt="Preview"
                className="mt-2 h-24 w-full object-cover rounded-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">IMDB Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.imdbRating}
                onChange={(e) => setFormData((prev) => ({ ...prev, imdbRating: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="9.3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Stars (e.g., 3.1M)</label>
              <input
                type="text"
                value={formData.imdbStarsText}
                onChange={(e) => setFormData((prev) => ({ ...prev, imdbStarsText: e.target.value }))}
                className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="3.1M"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="flex-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-emerald-100">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">External Links</label>
            <div className="space-y-2 mb-3">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-white/10"
                >
                  <span className="text-sm text-slate-300">
                    {link.name}: <span className="text-emerald-300">{link.url}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="text-red-300 hover:text-red-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentLink.name}
                onChange={(e) => setCurrentLink((prev) => ({ ...prev, name: e.target.value }))}
                className="flex-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                placeholder="Link name (e.g., IMDB)"
              />
              <input
                type="url"
                value={currentLink.url}
                onChange={(e) => setCurrentLink((prev) => ({ ...prev, url: e.target.value }))}
                className="flex-1 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 disabled:opacity-50 transition"
            >
              {isSaving ? "Saving..." : item ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
