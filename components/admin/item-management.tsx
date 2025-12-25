// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Trash2, Edit2, GripVertical } from "lucide-react"
// import DeleteConfirmation from "./delete-confirmation"

// interface Item {
//   id: string
//   title: string
//   categoryId: string
//   rank: number
// }

// export default function ItemManagement() {
//   const [items, setItems] = useState<Item[]>([
//     { id: "1", title: "The Shawshank Redemption", categoryId: "movies", rank: 1 },
//     { id: "2", title: "The Godfather", categoryId: "movies", rank: 2 },
//     { id: "3", title: "The Dark Knight", categoryId: "movies", rank: 3 },
//     { id: "4", title: "Breaking Bad", categoryId: "tv", rank: 1 },
//     { id: "5", title: "Game of Thrones", categoryId: "tv", rank: 2 },
//   ])

//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [formData, setFormData] = useState({ title: "", categoryId: "movies" })
//   const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
//   const [draggedItem, setDraggedItem] = useState<string | null>(null)

//   const categories = ["movies", "tv", "music", "actors", "gaming"]

//   const handleAddItem = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!formData.title.trim()) return

//     const newItem: Item = {
//       id: Date.now().toString(),
//       title: formData.title,
//       categoryId: formData.categoryId,
//       rank: items.filter((i) => i.categoryId === formData.categoryId).length + 1,
//     }

//     setItems([...items, newItem])
//     setFormData({ title: "", categoryId: "movies" })
//   }

//   const handleEditItem = (id: string) => {
//     const item = items.find((i) => i.id === id)
//     if (item) {
//       setEditingId(id)
//       setFormData({ title: item.title, categoryId: item.categoryId })
//     }
//   }

//   const handleUpdateItem = (e: React.FormEvent, id: string) => {
//     e.preventDefault()
//     if (!formData.title.trim()) return

//     setItems(items.map((i) => (i.id === id ? { ...i, title: formData.title, categoryId: formData.categoryId } : i)))
//     setEditingId(null)
//     setFormData({ title: "", categoryId: "movies" })
//   }

//   const handleDeleteItem = (id: string) => {
//     setItems(items.filter((i) => i.id !== id))
//     setDeleteTarget(null)
//   }

//   const handleDragStart = (id: string) => {
//     setDraggedItem(id)
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//   }

//   const handleDrop = (targetId: string) => {
//     if (!draggedItem || draggedItem === targetId) return

//     const draggedIndex = items.findIndex((i) => i.id === draggedItem)
//     const targetIndex = items.findIndex((i) => i.id === targetId)

//     const newItems = [...items]
//     const [draggedItemData] = newItems.splice(draggedIndex, 1)
//     newItems.splice(targetIndex, 0, draggedItemData)

//     const updatedItems = newItems.map((item, index) => {
//       const categoryItems = newItems.filter((i) => i.categoryId === item.categoryId)
//       const rank = categoryItems.indexOf(item) + 1
//       return { ...item, rank }
//     })

//     setItems(updatedItems)
//     setDraggedItem(null)
//   }

//   const groupedItems = categories.reduce(
//     (acc, cat) => {
//       acc[cat] = items.filter((i) => i.categoryId === cat).sort((a, b) => a.rank - b.rank)
//       return acc
//     },
//     {} as { [key: string]: Item[] },
//   )

//   return (
//     <div>
//       <div className="mb-8">
//         <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Manage Items</h2>

//         <form
//           onSubmit={editingId ? (e) => handleUpdateItem(e, editingId) : handleAddItem}
//           className="bg-card border border-border rounded-lg p-6 mb-8"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <div className="md:col-span-2">
//               <label className="block text-sm font-medium text-foreground mb-2">Item Title</label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 placeholder="e.g., The Shawshank Redemption"
//                 className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground mb-2">Category</label>
//               <select
//                 value={formData.categoryId}
//                 onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
//                 className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 {categories.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat.charAt(0).toUpperCase() + cat.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
//           >
//             {editingId ? "Update Item" : "Add Item"}
//           </button>
//           {editingId && (
//             <button
//               type="button"
//               onClick={() => {
//                 setEditingId(null)
//                 setFormData({ title: "", categoryId: "movies" })
//               }}
//               className="ml-2 px-6 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
//             >
//               Cancel
//             </button>
//           )}
//         </form>
//       </div>

//       <div className="space-y-12">
//         {categories.map((category) => (
//           <div key={category}>
//             <h3 className="text-2xl font-serif font-bold text-foreground mb-4 capitalize">{category}</h3>
//             <div className="space-y-3">
//               {groupedItems[category].map((item) => (
//                 <div
//                   key={item.id}
//                   draggable
//                   onDragStart={() => handleDragStart(item.id)}
//                   onDragOver={handleDragOver}
//                   onDrop={() => handleDrop(item.id)}
//                   className="p-4 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-300 cursor-move flex items-center gap-4 group"
//                 >
//                   <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
//                   <span className="w-8 h-8 flex items-center justify-center bg-accent/20 text-accent rounded-full font-bold text-sm flex-shrink-0">
//                     {item.rank}
//                   </span>
//                   <div className="flex-grow">
//                     <p className="font-serif font-bold text-foreground">{item.title}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEditItem(item.id)}
//                       className="p-2 hover:bg-muted rounded-lg transition-colors text-primary hover:text-primary/80"
//                     >
//                       <Edit2 className="w-5 h-5" />
//                     </button>
//                     <button
//                       onClick={() => setDeleteTarget(item.id)}
//                       className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive hover:text-destructive/80"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {groupedItems[category].length === 0 && (
//                 <p className="text-muted-foreground text-center py-8">No items in this category yet</p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {deleteTarget && (
//         <DeleteConfirmation
//           title="Delete Item"
//           message={`Are you sure you want to delete "${items.find((i) => i.id === deleteTarget)?.title}"? This action cannot be undone.`}
//           onConfirm={() => handleDeleteItem(deleteTarget)}
//           onCancel={() => setDeleteTarget(null)}
//         />
//       )}
//     </div>
//   )
// }
