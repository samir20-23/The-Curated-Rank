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
      const payload: any = { ...data }

      if (Array.isArray(payload.tags) && payload.tags.length === 0) delete payload.tags
      if (payload.type === "" || payload.type === undefined) delete payload.type

      // Compute rank per-type (rows) instead of global category length
      if (!payload.rank) {
        const targetType = payload.type
        const sameTypeItems = typeof targetType === "string"
          ? items.filter(i => i.type === targetType)
          : items.filter(i => !i.type)
        const maxRank = sameTypeItems.length > 0 ? Math.max(...sameTypeItems.map(i => i.rank)) : 0
        payload.rank = maxRank + 1
      }

      await addDoc(collection(db, "items"), payload)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateItem = async (id: string, data: Partial<Item>) => {
    try {
      const payload: any = { ...data }

      if (Array.isArray(payload.tags) && payload.tags.length === 0) delete payload.tags
      if (payload.type === "" || payload.type === undefined) delete payload.type

      await updateDoc(doc(db, "items", id), payload)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const deleteItem = async (itemOrId: Item | string) => {
    try {
      let id: string
      let imageUrl: string | undefined
      let deletedRank: number | undefined
      let deletedType: string | undefined


      if (typeof itemOrId === "string") {
        id = itemOrId
        // Find the item in state to get imageUrl, rank and type
        const item = items.find((i) => i.id === id)
        imageUrl = item?.imageUrl
        deletedRank = item?.rank
        deletedType = item?.type
      } else {
        id = itemOrId.id
        imageUrl = itemOrId.imageUrl
        deletedRank = itemOrId.rank
        deletedType = itemOrId.type
      }

      if (!id) throw new Error("Item ID is missing")

      // Delete image in Supabase
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop()
        if (fileName) await deleteImage("items", fileName)
      }

      // Delete Firebase document
      await deleteDoc(doc(db, "items", id))

      // Auto-update ranks: items after deleted item in the same type should decrease rank by 1
      if (deletedRank !== undefined && categoryId) {
        const itemsToUpdate = items
          .filter(item => item.id !== id && item.rank > deletedRank && (deletedType ? item.type === deletedType : !item.type))
          .map(item => ({ ...item, rank: item.rank - 1 }))

        if (itemsToUpdate.length > 0) {
          const batch = writeBatch(db)
          itemsToUpdate.forEach((item) => {
            batch.update(doc(db, "items", item.id), { rank: item.rank })
          })
          await batch.commit()
        }
      }
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
