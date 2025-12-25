// "use client"

// import { useState, useEffect } from "react"
// import type { Item, Category } from "@/lib/types"
// import { itemStore, categoryStore } from "@/lib/store"
// import CreateItemDialog from "./create-item-dialog"
// import DeleteConfirmation from "./delete-confirmation"
// import DraggableItemList from "./draggable-item-list"

// interface ItemListManagerProps {
//   categoryId: string
//   onBack: () => void
// }

// export default function ItemListManager({ categoryId, onBack }: ItemListManagerProps) {
//   const [items, setItems] = useState<Item[]>([])
//   const [category, setCategory] = useState<Category | null>(null)
//   const [isCreateOpen, setIsCreateOpen] = useState(false)
//   const [deleteItem, setDeleteItem] = useState<Item | null>(null)
//   const [editItem, setEditItem] = useState<Item | null>(null)

//   useEffect(() => {
//     const cat = categoryStore.getById(categoryId)
//     setCategory(cat || null)
//     setItems(itemStore.getByCategoryId(categoryId))
//   }, [categoryId])

//   const handleCreate = (item: Item) => {
//     setItems(itemStore.getByCategoryId(categoryId))
//     setIsCreateOpen(false)
//   }

//   const handleDelete = (item: Item) => {
//     itemStore.delete(item.id)
//     setItems(itemStore.getByCategoryId(categoryId))
//     setDeleteItem(null)
//   }

//   const handleReorder = (newItems: Item[]) => {
//     itemStore.updateRanks(categoryId, newItems)
//     setItems(newItems)
//   }

//   const handleEdit = (item: Item) => {
//     setItems(itemStore.getByCategoryId(categoryId))
//     setEditItem(null)
//   }

//   if (!category) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-foreground/60">Category not found</p>
//         <button
//           onClick={onBack}
//           className="mt-4 px-6 py-2 glass text-foreground hover:bg-secondary/30 rounded-lg transition duration-300"
//         >
//           Go Back
//         </button>
//       </div>
//     )
//   }
 
//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-1">
//           <button onClick={onBack} className="p-2 glass rounded-lg hover:bg-secondary/30 transition-colors">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <div>
//             <h2 className="text-4xl font-bold text-foreground">{category.name}</h2>
//             <p className="text-foreground/60 mt-1">Manage {category.name.toLowerCase()}</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setIsCreateOpen(true)}
//           className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-medium hover-lift"
//         >
//           Add Item
//         </button>
//       </div>

//       {items.length > 0 ? (
//         <div className="space-y-4">
//           <p className="text-foreground/60 text-sm">Drag items to reorder them</p>
//           <DraggableItemList items={items} onReorder={handleReorder} onEdit={setEditItem} onDelete={setDeleteItem} />
//         </div>
//       ) : (
//         <div className="text-center py-12 glass-strong rounded-xl">
//           <p className="text-foreground/60">No items yet. Create one to get started!</p>
//         </div>
//       )}

//       <CreateItemDialog
//         isOpen={isCreateOpen}
//         categoryId={categoryId}
//         categoryName={category.name}
//         onClose={() => setIsCreateOpen(false)}
//         onSuccess={handleCreate}
//         editingItem={editItem}
//         onEditClose={() => setEditItem(null)}
//         onEditSuccess={handleEdit}
//       />

//       <DeleteConfirmation
//         isOpen={deleteItem !== null}
//         title={`Delete "${deleteItem?.title}"?`}
//         description="This action cannot be undone."
//         onConfirm={() => deleteItem && handleDelete(deleteItem)}
//         onCancel={() => setDeleteItem(null)}
//       />
//     </div>
//   )
// }
