"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore"
import type { Category } from "@/lib/types"
import { deleteImage } from "@/lib/supabase"

export function useFirebaseCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "categories"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Category[]
        // Sort by optional `order` field for deterministic ordering
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setCategories(data)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const addCategory = async (data: Omit<Category, "id">) => {
    await addDoc(collection(db, "categories"), data)
  }
 
  const updateCategory = async (id: string, data: Partial<Category>) => {
    await updateDoc(doc(db, "categories", id), data)
  }

  const updateCategoriesOrder = async (ordered: Category[]) => {
    try {
      const batch = writeBatch(db)
      ordered.forEach((c, idx) => {
        batch.update(doc(db, "categories", c.id), { order: idx + 1 })
      })
      await batch.commit()
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const deleteCategory = async (categoryOrId: Category | string) => {
    try {
      let id: string
      let imageUrl: string | undefined

      if (typeof categoryOrId === "string") {
        id = categoryOrId
        imageUrl = categories.find((c) => c.id === id)?.imageUrl
      } else {
        id = categoryOrId.id
        imageUrl = categoryOrId.imageUrl
      }

      if (!id) throw new Error("missing category id")

      // 1️⃣ get all items for this category
      const itemsQuery = query(
        collection(db, "items"),
        where("categoryId", "==", id)
      )

      const itemsSnap = await getDocs(itemsQuery)
      const batch = writeBatch(db)

      // 2️⃣ delete items images + docs
      for (const d of itemsSnap.docs) {
        const item = d.data() as any

        if (item.imageUrl) {
          const fileName = item.imageUrl.split("/").pop()
          if (fileName) {
            await deleteImage("items", fileName)
          }
        }

        batch.delete(doc(db, "items", d.id))
      }

      await batch.commit()

      // 3️⃣ delete category image
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop()
        if (fileName) {
          await deleteImage("category", fileName)
        }
      }

      // 4️⃣ delete category doc
      await deleteDoc(doc(db, "categories", id))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    updateCategoriesOrder,
    deleteCategory,
  }
}
