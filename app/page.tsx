"use client"

import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import CategoriesGrid from "@/components/categories-grid"
import Footer from "@/components/footer"
import RandomItemsScroll from "@/components/random-items-scroll"
import CategoryCharts from "@/components/category-charts"

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)]  relative">
      <Navigation />
      <Hero />
      <main className="container mx-auto px-4  " style={{paddingTop: "15px"}}>
        <CategoriesGrid />
      </main>

      {/* Charts Section */}
      <CategoryCharts />

      {/* Infinite Horizontal Scroll of Random Items */}
      <RandomItemsScroll />

      <Footer />
    </div>
  )
}
