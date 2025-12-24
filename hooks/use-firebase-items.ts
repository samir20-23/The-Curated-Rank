"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore"
import type { Item } from "@/lib/types"
import { deleteImage } from "@/lib/supabase"

export function useFirebaseItems(categoryId?: string) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!categoryId) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(collection(db, "items"), where("categoryId", "==", categoryId))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Item[]
        setItems(data.sort((a, b) => a.rank - b.rank))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [categoryId])

  const addItem = async (data: Omit<Item, "id">) => {
    try {
      await addDoc(collection(db, "items"), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    try {
      await updateDoc(doc(db, "items", id), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const deleteItem = async (itemOrId: Item | string) => {
    try {
      let id: string
      let imageUrl: string | undefined

      if (typeof itemOrId === "string") {
        id = itemOrId
        // Find the item in state to get imageUrl
        const item = items.find((i) => i.id === id)
        imageUrl = item?.imageUrl
      } else {
        id = itemOrId.id
        imageUrl = itemOrId.imageUrl
      }

      if (!id) throw new Error("Item ID is missing")

      // Delete image in Supabase
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop()
        if (fileName) await deleteImage("items", fileName)
      }

      // Delete Firebase document
      await deleteDoc(doc(db, "items", id))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateRanks = async (newItems: Item[]) => {
    try {
      const batch = writeBatch(db)
      newItems.forEach((item) => {
        batch.update(doc(db, "items", item.id), { rank: item.rank })
      })
      await batch.commit()
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return { items, loading, error, addItem, updateItem, deleteItem, updateRanks }
}
