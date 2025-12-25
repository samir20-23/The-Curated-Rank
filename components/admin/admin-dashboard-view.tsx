// "use client"

// import { useState } from "react"
// import { useFirebaseCategories } from "@/hooks/use-firebase-categories"
// import CreateCategoryDialog from "./create-category-dialog"
// import CategoryItemsManager from "./category-items-manager"
// import DeleteConfirmation from "./delete-confirmation"
// import type { Category } from "@/lib/types"

// export default function AdminDashboardView() {
//   const { categories, loading, deleteCategory } = useFirebaseCategories()
//   const [isCreateOpen, setIsCreateOpen] = useState(false)
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
//   const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null)

//   const handleDelete = async (category: Category) => {
//     try {
//       await deleteCategory(category.id)
//       setDeleteTarget(null)
//     } catch (error) {
//       console.error("Delete failed:", error)
//     }
//   }

//   if (selectedCategory) {
//     return <CategoryItemsManager category={selectedCategory} onBack={() => setSelectedCategory(null)} />
//   }

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-1xl md:text-2xl font-bold text-foreground">Admin Dashboard</h1>
//           <p className="text-foreground/60 mt-2">Manage your curated content</p>
//         </div>
//         <button
//           onClick={() => setIsCreateOpen(true)}
//           className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover:scale-105 hover:shadow-2xl transition duration-300"
//         >
//           Create Category
//         </button>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">
//           <p className="text-foreground/60">Loading categories...</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {categories.map((category) => (
//             <div
//               key={category.id}
//               className="group glass-strong rounded-xl p-6 hover:scale-105 hover:shadow-2xl transition duration-300 cursor-pointer"
//               onClick={() => setSelectedCategory(category)}
//             >
//               <div className="mb-4">
//                 {category.imageUrl ? (
//                   <img
//                     src={category.imageUrl || "/placeholder.svg"}
//                     alt={category.name}
//                     className="w-full h-40 object-cover rounded-lg"
//                   />
//                 ) : (
//                   <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
//                     <span className="text-5xl">📌</span>
//                   </div>
//                 )}
//               </div>

//               <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
//                 {category.name}
//               </h3>
//               <p className="text-foreground/60 mt-2">Type: {category.type}</p>

//               <div className="flex gap-2 mt-6 pt-6 border-t border-border/20">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     setSelectedCategory(category)
//                   }}
//                   className="flex-1 px-3 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg text-sm font-medium transition duration-300"
//                 >
//                   Manage Items
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     setEditingCategory(category)
//                   }}
//                   className="flex-1 px-3 py-2 glass text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition duration-300"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     setDeleteTarget(category)
//                   }}
//                   className="flex-1 px-3 py-2 glass text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition duration-300"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {!loading && categories.length === 0 && (
//         <div className="text-center py-12 glass-strong rounded-xl">
//           <p className="text-foreground/60 mb-4">No categories yet. Create your first one!</p>
//           <button
//             onClick={() => setIsCreateOpen(true)}
//             className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
//           >
//             Create Category
//           </button>
//         </div>
//       )}

//       <CreateCategoryDialog 
//         isOpen={isCreateOpen || editingCategory !== null} 
//         onClose={() => {
//           setIsCreateOpen(false)
//           setEditingCategory(null)
//         }}
//         editingCategory={editingCategory}
//       />

//       <DeleteConfirmation
//         isOpen={deleteTarget !== null}
//         title={`Delete "${deleteTarget?.name}"?`}
//         description="This action cannot be undone. All items in this category will be removed."
//         onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
//         onCancel={() => setDeleteTarget(null)}
//       />
//     </div>
//   )
// }
