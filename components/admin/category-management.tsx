// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Trash2, Edit2 } from "lucide-react"
// import DeleteConfirmation from "./delete-confirmation"

// interface Category {
//   id: string
//   title: string
//   description: string
//   itemCount: number
// }

// export default function CategoryManagement() {
//   const [categories, setCategories] = useState<Category[]>([
//     { id: "movies", title: "Movies", description: "Top-rated films", itemCount: 5 },
//     { id: "tv", title: "TV Shows", description: "Best series", itemCount: 3 },
//     { id: "music", title: "Music", description: "Great albums", itemCount: 4 },
//     { id: "actors", title: "Actors", description: "Talented performers", itemCount: 2 },
//     { id: "gaming", title: "Gaming", description: "Top games", itemCount: 6 },
//   ])

//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [formData, setFormData] = useState({ title: "", description: "" })
//   const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

//   const handleAddCategory = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!formData.title.trim()) return

//     const newCategory: Category = {
//       id: formData.title.toLowerCase().replace(/\s+/g, "-"),
//       title: formData.title,
//       description: formData.description,
//       itemCount: 0,
//     }

//     setCategories([...categories, newCategory])
//     setFormData({ title: "", description: "" })
//   }

//   const handleEditCategory = (id: string) => {
//     const category = categories.find((c) => c.id === id)
//     if (category) {
//       setEditingId(id)
//       setFormData({ title: category.title, description: category.description })
//     }
//   }

//   const handleUpdateCategory = (e: React.FormEvent, id: string) => {
//     e.preventDefault()
//     if (!formData.title.trim()) return

//     setCategories(
//       categories.map((c) => (c.id === id ? { ...c, title: formData.title, description: formData.description } : c)),
//     )
//     setEditingId(null)
//     setFormData({ title: "", description: "" })
//   }

//   const handleDeleteCategory = (id: string) => {
//     setCategories(categories.filter((c) => c.id !== id))
//     setDeleteTarget(null)
//   }

//   return (
//     <div>
//       <div className="mb-8">
//         <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Manage Categories</h2>

//         <form
//           onSubmit={editingId ? (e) => handleUpdateCategory(e, editingId) : handleAddCategory}
//           className="bg-card border border-border rounded-lg p-6 mb-8"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Category Title</label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 placeholder="e.g., Movies"
//                 className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Description</label>
//               <input
//                 type="text"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="e.g., Top-rated films"
//                 className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
//           >
//             {editingId ? "Update Category" : "Add Category"}
//           </button>
//           {editingId && (
//             <button
//               type="button"
//               onClick={() => {
//                 setEditingId(null)
//                 setFormData({ title: "", description: "" })
//               }}
//               className="ml-2 px-6 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
//             >
//               Cancel
//             </button>
//           )}
//         </form>
//       </div>

//       <div className="space-y-4">
//         {categories.map((category) => (
//           <div
//             key={category.id}
//             className="p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-300"
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex-grow">
//                 <h3 className="text-xl font-serif font-bold text-foreground mb-2">{category.title}</h3>
//                 <p className="text-muted-foreground mb-3">{category.description}</p>
//                 <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
//                   {category.itemCount} items
//                 </span>
//               </div>
//               <div className="flex gap-2 ml-4">
//                 <button
//                   onClick={() => handleEditCategory(category.id)}
//                   className="p-2 hover:bg-muted rounded-lg transition-colors text-primary hover:text-primary/80"
//                 >
//                   <Edit2 className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => setDeleteTarget(category.id)}
//                   className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive hover:text-destructive/80"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {deleteTarget && (
//         <DeleteConfirmation
//           title="Delete Category"
//           message={`Are you sure you want to delete "${categories.find((c) => c.id === deleteTarget)?.title}"? This action cannot be undone.`}
//           onConfirm={() => handleDeleteCategory(deleteTarget)}
//           onCancel={() => setDeleteTarget(null)}
//         />
//       )}
//     </div>
//   )
// }
