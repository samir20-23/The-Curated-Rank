import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or API key")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(
  file: File,
  folder = "category",
  nameInput?: string
): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const safeName = nameInput
    ? nameInput.replace(/\s+/g, "-").toLowerCase()
    : `${Date.now()}-${Math.random().toString(36).substring(7)}`
  const fileName = `${safeName}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage
    .from("the-curated-rank")
    .upload(filePath, file, { upsert: true })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: publicData } = supabase.storage
    .from("the-curated-rank")
    .getPublicUrl(filePath)

  return publicData.publicUrl
}

export async function deleteImage(folder: string, fileName: string): Promise<void> {
  const filePath = `${folder}/${fileName}`

  const { error } = await supabase.storage
    .from("the-curated-rank")
    .remove([filePath])

  if (error) {
    console.error("Supabase delete failed:", error.message)
  }
}
