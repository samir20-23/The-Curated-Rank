"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import './list.css'
interface CategoryListViewProps {
  categoryId: string
  onBack: () => void
}

export default function CategoryListView({ categoryId, onBack }: CategoryListViewProps) {
  const [filterText, setFilterText] = useState("")
  const router = useRouter()
  const { items, loading: itemsLoading } = useFirebaseItems(categoryId)
  const { categories } = useFirebaseCategories()

  const category = categories.find((c) => c.id === categoryId)
  const filteredItems = items.filter((item) => item.title.toLowerCase().includes(filterText.toLowerCase()))

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/")} className="p-2 glass rounded-lg hover:bg-secondary/50 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{category?.name}</h2>
          <p className="text-foreground/60 mt-2">
            {category?.tags && category.tags.length > 0 ? (
              <span>Types: {category.tags.join(", ")}</span>
            ) : (
              <span>Type: {category?.type}</span>
            )}
          </p>
        </div>
      </div>

      <div className="glass-strong rounded-xl p-4">
        <input
          type="text"
          placeholder="Search items..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full bg-transparent text-foreground placeholder:text-foreground/40 focus:outline-none"
        />
      </div>

      {itemsLoading ? (
        <div className="text-center py-12">
          <p className="text-foreground/60">Loading items...</p>
        </div>
      ) : (
        <div className="space-y-4" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          width: "100%"
        }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/item/${item.id}`)}
              className="group glass-strong rounded-xl overflow-hidden hover-lift flex items-center gap-6"

              style={{
                position: "relative",
                maxWidth: "90%",
                width: "30%",
                cursor: "pointer"
              }}>
              {/* Item image */}
              <div className="flex-shrink-0 w-28">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-l-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center rounded-l-xl">
                    <span className="text-2xl">📌</span>
                  </div>
                )}
              </div>

              {/* Item info */}
              <div className="flex-grow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors" >
                      <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                        style={{
                          position: "absolute",
                          left: "110px",
                          top: "0",
                          padding: "12px"
                        }} >
                        #{item.rank}
                      </span>

                      {item.title}
                    </h3>
                    <p className="text-foreground/60 text-sm line-clamp-1 ">{item.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
      }

      {
        !itemsLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60 text-lg">No items found matching your search.</p>
          </div>
        )
      }
    </div >
  )
}
