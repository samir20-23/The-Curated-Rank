"use client"

import { useEffect, useState } from "react"
import { onAuthChange } from "@/lib/auth"
import type { User as FirebaseUser } from "firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, isLoading }
}
