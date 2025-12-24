"use client"

import { useParams } from "next/navigation"
import Navigation from "@/components/navigation"
import CategoryListView from "@/components/category-list-view"
import Footer from "@/components/footer"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.id as string

  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)] relative">
      <Navigation />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <CategoryListView categoryId={categoryId} onBack={() => window.history.back()} />
      </main>
      <Footer />
    </div>
  )
}

