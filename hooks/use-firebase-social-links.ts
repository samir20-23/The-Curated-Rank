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
  writeBatch,
} from "firebase/firestore"
import type { SocialLink } from "@/lib/types"

export function useFirebaseSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "socialLinks"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SocialLink[]
        // Sort by optional `order` field
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setLinks(data)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const addLink = async (data: Omit<SocialLink, "id">) => {
    try {
      await addDoc(collection(db, "socialLinks"), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateLink = async (id: string, data: Partial<SocialLink>) => {
    try {
      await updateDoc(doc(db, "socialLinks", id), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const deleteLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, "socialLinks", id))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updateLinksOrder = async (ordered: SocialLink[]) => {
    try {
      const batch = writeBatch(db)
      ordered.forEach((link, idx) => {
        batch.update(doc(db, "socialLinks", link.id), { order: idx + 1 })
      })
      await batch.commit()
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return { links, loading, error, addLink, updateLink, deleteLink, updateLinksOrder }
}

