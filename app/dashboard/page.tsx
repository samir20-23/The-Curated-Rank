"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CategoryList } from "@/components/admin/category-list"
import { ListView } from "@/components/admin/list-view"
import { ItemView } from "@/components/admin/item-view"
import { AuthGuard } from "@/components/auth-guard"
import { logoutUser } from "@/lib/auth"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("categories")
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/50 p-6 overflow-y-auto">
          <Link href="/" className="block mb-8">
            <h1 className="text-2xl font-bold text-emerald-300">The Curated Rank</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </Link>

          <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "categories"
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("lists")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "lists"
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Lists
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === "items"
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Items
            </button>
          </nav>

          <div className="border-t border-white/10 mt-8 pt-4">
            <button
              onClick={handleLogout}
              className="w-full text-left text-slate-400 hover:text-slate-200 transition text-sm px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === "categories" && <CategoryList />}
            {activeTab === "lists" && <ListView />}
            {activeTab === "items" && <ItemView />}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
