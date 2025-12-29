"use client"

import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import CategoriesGrid from "@/components/categories-grid"
import Footer from "@/components/footer"
import RandomItemsScroll from "@/components/random-items-scroll"
import CategoryCharts from "@/components/category-charts"
import SocialPostsScroll from "@/components/social-posts-scroll"
import Loading from "@/components/loading"

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgba(0,0,0,0.5)]  relative" >
      <Navigation />
      <Hero />
      {/* <Loading /> */}
      <main className="container mx-auto px-4  " style={{ padding: "25px" }}>
        <CategoriesGrid />
      </main>

      {/* Charts Section */}
      <CategoryCharts />
      {/* Infinite Horizontal Scroll of Random Items */}
      <RandomItemsScroll />
      {/* Social Media Posts Scroll - between footer and infinite scroll */}
      <hr />
      <br />
      <SocialPostsScroll />
      <Footer />
    </div>
  )
}
