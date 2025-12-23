import { db } from "./firebase"
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import type { Category, List, ListItem } from "./types"

// Categories
export async function getCategories() {
  try {
    const q = query(collection(db, "categories"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export function onCategoriesChange(callback: (categories: Category[]) => void) {
  const q = query(collection(db, "categories"))
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
    callback(categories)
  })
}

export async function createCategory(categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  try {
    const docRef = await addDoc(collection(db, "categories"), {
      ...categoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

export async function updateCategory(id: string, data: Partial<Category>) {
  try {
    await updateDoc(doc(db, "categories", id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    // Delete all lists in this category
    const lists = await getListsByCategory(id)
    const batch = writeBatch(db)

    for (const list of lists) {
      batch.delete(doc(db, "lists", list.id))
    }

    batch.delete(doc(db, "categories", id))
    await batch.commit()
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// Lists
export async function getListsByCategory(categoryId: string) {
  try {
    const q = query(collection(db, "lists"), where("categoryId", "==", categoryId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as List)
  } catch (error) {
    console.error("Error fetching lists:", error)
    return []
  }
}

export function onListsChange(categoryId: string, callback: (lists: List[]) => void) {
  const q = query(collection(db, "lists"), where("categoryId", "==", categoryId))
  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as List)
    callback(lists)
  })
}

export async function createList(listData: Omit<List, "id" | "createdAt" | "updatedAt">) {
  try {
    const docRef = await addDoc(collection(db, "lists"), {
      ...listData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating list:", error)
    throw error
  }
}

export async function updateList(id: string, data: Partial<List>) {
  try {
    await updateDoc(doc(db, "lists", id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating list:", error)
    throw error
  }
}

export async function deleteList(id: string) {
  try {
    await deleteDoc(doc(db, "lists", id))
  } catch (error) {
    console.error("Error deleting list:", error)
    throw error
  }
}

export async function duplicateList(listId: string) {
  try {
    const listDoc = await getDoc(doc(db, "lists", listId))
    if (!listDoc.exists()) {
      throw new Error("List not found")
    }

    const listData = listDoc.data() as List
    const newListData = {
      ...listData,
      title: `${listData.title} (Copy)`,
    }

    const newListId = await createList(newListData)
    return newListId
  } catch (error) {
    console.error("Error duplicating list:", error)
    throw error
  }
}

// List Items
export async function getListItems(listId: string) {
  try {
    const q = query(collection(db, "listItems"), where("listId", "==", listId))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as ListItem)
      .sort((a, b) => a.position - b.position)
  } catch (error) {
    console.error("Error fetching list items:", error)
    return []
  }
}

export async function createListItem(itemData: Omit<ListItem, "id" | "createdAt" | "updatedAt">) {
  try {
    const docRef = await addDoc(collection(db, "listItems"), {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating list item:", error)
    throw error
  }
}

export async function updateListItem(id: string, data: Partial<ListItem>) {
  try {
    await updateDoc(doc(db, "listItems", id), {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating list item:", error)
    throw error
  }
}

export async function deleteListItem(id: string) {
  try {
    await deleteDoc(doc(db, "listItems", id))
  } catch (error) {
    console.error("Error deleting list item:", error)
    throw error
  }
}

export async function updateListItemPosition(listId: string, items: ListItem[]) {
  try {
    const batch = writeBatch(db)
    items.forEach((item) => {
      batch.update(doc(db, "listItems", item.id), { position: item.position })
    })
    await batch.commit()
  } catch (error) {
    console.error("Error updating item positions:", error)
    throw error
  }
}
