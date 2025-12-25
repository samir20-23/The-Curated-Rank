"use client"

import { useState, useEffect } from "react"
import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  PolarAreaController,
  BubbleController,
  ScatterController,
  Tooltip,
  Legend,
  Title
} from "chart.js"
import { Line, Bar, Pie, Doughnut, Radar, PolarArea, Bubble, Scatter } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadarController,
  LineController,
  BarController,
  DoughnutController,
  PieController,
  PolarAreaController,
  BubbleController,
  ScatterController,
  Tooltip,
  Legend,
  Title
)

export default function CategoryCharts() {
  const { categories } = useFirebaseCategories()
  const [overviewStats, setOverviewStats] = useState<{ name: string; count: number; id: string }[]>([])
  const [categoryBreakdowns, setCategoryBreakdowns] = useState<
    { id: string; name: string; imageUrl?: string; total: number; typeCounts: Record<string, number> }[]
  >([])
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const overview = await Promise.all(
        categories.map(async (cat) => {
          try {
            const q = query(collection(db, "items"), where("categoryId", "==", cat.id))
            const snap = await getDocs(q)
            return { name: cat.name, count: snap.size, id: cat.id }
          } catch {
            return { name: cat.name, count: 0, id: cat.id }
          }
        })
      )
      setOverviewStats(overview)

      const breakdowns = await Promise.all(
        categories.map(async (cat) => {
          try {
            const q = query(collection(db, "items"), where("categoryId", "==", cat.id))
            const snap = await getDocs(q)
            const typeCounts: Record<string, number> = {}
            let total = 0
            snap.docs.forEach((d) => {
              const it = d.data() as any
              let key = "No type"
              if (typeof it.type === "string" && it.type.trim() !== "") key = it.type.trim()
              else if (Array.isArray(it.tags) && it.tags.length > 0) key = it.tags[0]
              if (!typeCounts[key]) typeCounts[key] = 0
              typeCounts[key]++
              total++
            })
            return { id: cat.id, name: cat.name, imageUrl: (cat as any).imageUrl, total, typeCounts }
          } catch {
            return { id: cat.id, name: cat.name, imageUrl: (cat as any).imageUrl, total: 0, typeCounts: {} }
          }
        })
      )
      setCategoryBreakdowns(breakdowns)
    }

    if (categories.length > 0) fetchAll()
  }, [categories])

  if (!overviewStats.length) return null

  const labels = overviewStats.map(s => s.name)
  const dataCounts = overviewStats.map(s => s.count)

  const overviewData = {
    labels,
    datasets: [
      {
        label: "Items per category",
        data: dataCounts,
        backgroundColor: labels.map((_, i) => `rgba(${50 + i * 30}, ${100 + i * 15}, ${150 + i * 10}, 0.7)`),
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
        hoverOffset: 8
      }
    ]
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Overview: Items by Category" },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed} items`
          }
        }
      }
    }
  }

  const displayed = showMore ? categoryBreakdowns : categoryBreakdowns.slice(0, 3)

  return (
    <div className="mt-12 w-full flex flex-col items-center gap-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-strong rounded-xl p-4 h-64 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Line · Overview</h3>
          <div className="flex-1">
            <Line data={overviewData} options={baseOptions} />
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4 h-64 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Bar · Overview</h3>
          <div className="flex-1">
            <Bar data={overviewData} options={baseOptions} />
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4 h-64 flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Doughnut · Overview</h3>
          <div className="flex-1 flex items-center justify-center">
            <Doughnut data={overviewData} options={{ ...baseOptions, plugins: { title: { display: true, text: "Share by category" } } }} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Category breakdown</h2>
          {categoryBreakdowns.length > 3 && (
            <button onClick={() => setShowMore(!showMore)} className="px-3 py-1 glass rounded-md text-sm">
              {showMore ? "Show less" : `Show more (${categoryBreakdowns.length})`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((cat, idx) => {
            const typeLabels = Object.keys(cat.typeCounts)
            const typeData = typeLabels.map(k => cat.typeCounts[k])
            const doughnutData = {
              labels: typeLabels.length ? typeLabels : ["No type"],
              datasets: [
                {
                  label: `${cat.name} types`,
                  data: typeData.length ? typeData : [0],
                  backgroundColor: (typeLabels.length ? typeLabels : ["No type"]).map(
                    (_, i) => `rgba(${80 + i * 20}, ${120 + i * 10}, ${170 + i * 5}, 0.75)`
                  ),
                  hoverOffset: 10
                }
              ]
            }

            return (
              <div
                key={cat.id}
                className="rounded-xl p-4 flex flex-col gap-3 glass-strong shadow-lg hover:scale-105 transition-transform"
                style={{ minHeight: 220 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                    {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" /> : <div>📁</div>}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground/70">Category</div>
                    <div className="font-semibold">{cat.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-foreground/60">Total</div>
                    <div className="font-bold text-lg">{cat.total}</div>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div style={{ width: 160, height: 120 }}>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        ...baseOptions,
                        plugins: {
                          legend: { position: "bottom" },
                          title: { display: true, text: `${cat.name} types` },
                          tooltip: {
                            callbacks: {
                              label: (context: any) => `${context.label}: ${context.parsed} items`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-foreground/70">
                  <div>{typeLabels.length ? typeLabels.slice(0, 3).join(", ") : "No types"}</div>
                  <div className="text-foreground/90">Hover chart</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
