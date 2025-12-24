"use client"

import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import CategoriesGrid from "@/components/categories-grid"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)]  relative">
      <Navigation />
      <Hero />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <CategoriesGrid />
      </main>
      <Footer />
    </div>
  )
}
