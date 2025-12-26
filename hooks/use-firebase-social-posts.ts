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
import type { SocialPost } from "@/lib/types"
import { deleteImage } from "@/lib/supabase"

export function useFirebaseSocialPosts() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "socialPosts"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as SocialPost[]
        // Sort by optional `order` field
        data.sort((a, b) => (a.order || 0) - (b.order || 0))
        setPosts(data)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  const addPost = async (data: Omit<SocialPost, "id">) => {
    try {
      await addDoc(collection(db, "socialPosts"), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updatePost = async (id: string, data: Partial<SocialPost>) => {
    try {
      await updateDoc(doc(db, "socialPosts", id), data)
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const post = posts.find((p) => p.id === id)
      // Delete image in Supabase if exists
      if (post?.imageUrl) {
        const fileName = post.imageUrl.split("/").pop()
        if (fileName) await deleteImage("socialPosts", fileName)
      }
      await deleteDoc(doc(db, "socialPosts", id))
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  const updatePostsOrder = async (ordered: SocialPost[]) => {
    try {
      const batch = writeBatch(db)
      ordered.forEach((post, idx) => {
        batch.update(doc(db, "socialPosts", post.id), { order: idx + 1 })
      })
      await batch.commit()
    } catch (err) {
      setError((err as Error).message)
      throw err
    }
  }

  return { posts, loading, error, addPost, updatePost, deletePost, updatePostsOrder }
}

