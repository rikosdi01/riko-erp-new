import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class ItemsRepository {
    static subscribeToItemsChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Items'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }
    
        static async checkItemsExists(itemCode, categoryId, excludeId = null) {
            try {
                const q = query(
                    collection(db, "Items"),
                    where("code", "==", itemCode),
                    where("category.id", "==", categoryId),
                    limit(1)
                );
    
                const querySnapshot = await getDocs(q);
    
                return querySnapshot.docs.some(doc => doc.id !== excludeId);
            } catch (error) {
                console.error("Error checking category existence: ", error);
                throw error
            }
        }

    static getItems(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const itemsQuery = query(
                collection(db, "Items"),
                orderBy("name")
            );

            return onSnapshot(itemsQuery, (querySnapshot) => {
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(items);
            });
        } catch (error) {
            console.error("Error listening to items: ", error);
        }
    }

    static async getItemsById(itemId) {
        try {
            const docRef = doc(db, "Items", itemId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching items: ", error);
            throw error;
        }
    }

    static async createItem(items) {
        try {
            const docRef = await addDoc(collection(db, "Items"), items);
            await updateDoc(doc(db, "Items", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating items: ", error);
            throw error;
        }
    }

    static async updateItem(itemId, updatedItem) {
        try {
            const docRef = doc(db, "Items", itemId);
            await updateDoc(docRef, updatedItem);
        } catch (error) {
            console.error("Error updating items: ", error);
            throw error;
        }
    }

    static async deleteItem(itemId) {
        try {
            const docRef = doc(db, "Items", itemId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting items: ", error);
            throw error;
        }
    }

    static async deleteItems(itemId) {
        try {
            if (!Array.isArray(itemId)) {
                itemId = [itemId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = itemId.map(async (id) => {
                const docRef = doc(db, "Items", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting items: ", error);
            throw error;
        }
    }
}