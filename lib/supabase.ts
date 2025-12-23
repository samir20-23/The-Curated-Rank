import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or API key")
}

// Initialize Supabase client for image uploads
export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(file: File, bucket = "images"): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicData.publicUrl
}
