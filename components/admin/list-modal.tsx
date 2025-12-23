"use client"

import type React from "react"

import { useState } from "react"
import type { List, Category } from "@/lib/types"

interface ListModalProps {
  isOpen: boolean
  list?: List | null
  categoryId?: string
  categories: Category[]
  onClose: () => void
  onSave: (data: Omit<List, "id" | "createdAt" | "updatedAt" | "items">) => Promise<void>
}

export function ListModal({ isOpen, list, categoryId, categories, onClose, onSave }: ListModalProps) {
  const [formData, setFormData] = useState({
    title: list?.title || "",
    description: list?.description || "",
    coverImage: list?.coverImage || "",
    categoryId: list?.categoryId || categoryId || "",
    tags: list?.tags || ([] as string[]),
    visibility: (list?.visibility || "public") as "public" | "private",
    owner: list?.owner || "Marwan Bobssi",
    editorPick: list?.editorPick || false,
  })

  const [currentTag, setCurrentTag] = useState("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await onSave({
        ...formData,
        items: [],
        stats: { views: 0, likes: 0, saves: 0 },
      } as any)

      setFormData({
        title: "",
        description: "",
        coverImage: "",
        categoryId: categoryId || "",
        tags: [],
        visibility: "public",
        owner: "Marwan Bobssi",
        editorPick: false,
      })
      onClose()
    } catch (error) {
      console.error("Error saving list:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-semibold text-white">{list ? "Edit List" : "Create List"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="e.g., Best Prison Movies"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              placeholder="Describe this list"
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
            <label className="block text-sm font-medium text-slate-200 mb-2">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value as "public" | "private" }))}
              className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.editorPick}
              onChange={(e) => setFormData((prev) => ({ ...prev, editorPick: e.target.checked }))}
              className="w-4 h-4 rounded border-white/10 bg-slate-800"
            />
            <span className="text-sm text-slate-200">Editor Pick</span>
          </label>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-400 text-slate-900 font-semibold hover:bg-emerald-300 disabled:opacity-50 transition"
            >
              {isSaving ? "Saving..." : list ? "Update" : "Create"}
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
