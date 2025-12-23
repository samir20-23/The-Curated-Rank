'use client'

import { useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { supabase } from '../../lib/supabase'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch all items from Firebase
  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, 'items'))
    const data: any[] = []
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
    setItems(data)
  }

  const handleUpload = async () => {
    if (!title || !description || !file) return alert('Please fill all fields and select an image')
    setLoading(true)

    try {
      // 1️⃣ Upload image to Supabase storage
      const filePath = `uploads/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('public-files')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2️⃣ Get public URL of the image
      const { data: urlData } = supabase.storage.from('public-files').getPublicUrl(filePath)
      const imageUrl = urlData.publicUrl

      // 3️⃣ Save text + image URL to Firebase
      await addDoc(collection(db, 'items'), {
        title,
        description,
        imageUrl,
        createdAt: new Date().toISOString()
      })

      // 4️⃣ Clear inputs
      setTitle('')
      setDescription('')
      setFile(null)

      // 5️⃣ Refresh items
      fetchItems()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">🔥 Upload Demo (Supabase + Firebase)</h1>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2 w-full"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          type="file"
          className="border rounded px-3 py-2 w-full"
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded w-full"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="border p-4 rounded shadow flex gap-4 items-center">
            <img src={item.imageUrl} alt={item.title} className="w-24 h-24 object-cover rounded" />
            <div>
              <h2 className="font-semibold">{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
