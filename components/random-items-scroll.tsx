"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { useFirebaseItems } from "@/hooks/use-firebase-items"
import type { Item } from "@/lib/types"

export default function RandomItemsScroll() {
  const router = useRouter()
  const { categories } = useFirebaseCategories()
  const [randomItems, setRandomItems] = useState<Array<Item & { categoryName: string }>>([])

  useEffect(() => {
    const fetchAllItems = async () => {
      const allItems: Array<Item & { categoryName: string }> = []
      
      for (const category of categories) {
        try {
          const { db } = await import("@/lib/firebase")
          const { collection, query, where, getDocs } = await import("firebase/firestore")
          const itemsQuery = query(collection(db, "items"), where("categoryId", "==", category.id))
          const itemsSnapshot = await getDocs(itemsQuery)
          
          itemsSnapshot.docs.forEach(doc => {
            const item = { id: doc.id, ...doc.data() } as Item
            if (item.imageUrl) {
              allItems.push({ ...item, categoryName: category.name })
            }
          })
        } catch (error) {
          console.error(`Error fetching items for category ${category.id}:`, error)
        }
      }
      
      // Shuffle and take random items
      const shuffled = allItems.sort(() => 0.5 - Math.random())
      setRandomItems(shuffled.slice(0, 30))
    }

    if (categories.length > 0) {
      fetchAllItems()
    }
  }, [categories])

  if (randomItems.length === 0) return null

  return (
    <div className="mt-16 mb-8">
      <div className="relative overflow-hidden py-8">
        <div 
          className="flex gap-4 animate-scroll-right"
          style={{ width: "max-content" }}
        >
          {[...randomItems, ...randomItems].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => router.push(`/item/${item.id}`)}
              className="flex-shrink-0 w-32 h-48 glass-strong rounded-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title || "Item"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <span className="text-2xl">📌</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

