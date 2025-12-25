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
      <main className="container mx-auto px-4   " style={{paddingTop: "15px"}}>
        <CategoryListView categoryId={categoryId} onBack={() => window.history.back()} />
      </main>
      <Footer />
    </div>
  )
}

