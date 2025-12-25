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
            <main className="container mx-auto px-4  " style={{ paddingTop: "15px" }}>
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

// "use client"

// import { useAuth } from "@/contexts/auth-context"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"
// // import AdminNavigation from "@/components/admin/admin-navigation"
// // import AdminDashboardView from "@/components/admin/admin-dashboard-view"

// export default function AdminPage() {
//   const { user, loading, isAdmin } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     if (!loading && (!user || !isAdmin)) {
//       router.push("/login")
//     }
//   }, [user, loading, isAdmin, router])

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p className="text-foreground/60">Loading...</p>
//       </div>
//     )
//   }

//   if (!isAdmin) {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-[rgba(0,0,0,0.5)]">
//       <AdminNavigation />
//       <main className="container mx-auto px-4 py-8">
//         <AdminDashboardView />
//       </main>
//     </div>
//   )
// }
