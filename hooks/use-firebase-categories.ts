"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import type { Category } from "@/lib/types"
import { deleteImage } from "@/lib/supabase"

export function useFirebaseCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(data.sort((a, b) => a.name.localeCompare(b.name)))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  const addCategory = async (data: Omit<Category, "id">) => {
    try {
      await addDoc(collection(db, "categories"), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await updateDoc(doc(db, "categories", id), data)
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
        const category = categories.find((c) => c.id === id)
        imageUrl = category?.imageUrl
      } else {
        id = categoryOrId.id
        imageUrl = categoryOrId.imageUrl
      }

      if (!id) throw new Error("Category ID is missing")

      // Delete category image in Supabase
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop()
        if (fileName) await deleteImage("category", fileName)
      }

      // Delete Firebase document
      await deleteDoc(doc(db, "categories", id))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return { categories, loading, error, addCategory, updateCategory, deleteCategory }
}
