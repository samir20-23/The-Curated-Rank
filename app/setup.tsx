'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { db, storage } from '../../lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export default function SetupPage() {
  const [status, setStatus] = useState<string>('Starting setup...')
  const [firebaseTest, setFirebaseTest] = useState<string>('')

  const bucketName = 'public-files' // change if your bucket name is different

  useEffect(() => {
    const setup = async () => {
      try {
        // ---------------- Supabase ----------------
        setStatus('Checking Supabase bucket...')
        // List buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()
        if (listError) throw listError

        const bucketExists = buckets.some(b => b.name === bucketName)

        if (!bucketExists) {
          setStatus(`Bucket "${bucketName}" not found. Creating...`)
          const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, { public: true })
          if (createError) throw createError
          setStatus(`Bucket "${bucketName}" created!`)
        } else {
          setStatus(`Bucket "${bucketName}" already exists!`)
        }

        // ---------------- Firebase ----------------
        setStatus(prev => prev + ' | Testing Firebase...')
        const snapshot = await getDocs(collection(db, 'setupTest'))
        setFirebaseTest(`Firebase works! Found ${snapshot.size} docs in 'setupTest' collection.`)

        setStatus('✅ Setup complete!')
      } catch (err: any) {
        setStatus('❌ Error: ' + err.message)
      }
    }

    setup()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">⚙️ Project Setup</h1>
      <p className="text-lg">{status}</p>
      {firebaseTest && <p className="text-green-600">{firebaseTest}</p>}
    </div>
  )
}
