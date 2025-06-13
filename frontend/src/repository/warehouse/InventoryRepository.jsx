import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class InventoryRepository {
    static subscribeToInvetoryChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Inventory'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkInventoryCodeExists(inventoryCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "Inventory"),
                where("code", "==", inventoryCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking inventory existence: ", error);
            throw error
        }
    }

    static async getInventoryById(inventoryId) {
        try {
            const docRef = doc(db, "Inventory", inventoryId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching inventory: ", error);
            throw error;
        }
    }

    static async createInventory(inventory) {
        try {
            const docRef = await addDoc(collection(db, "Inventory"), inventory);
            await updateDoc(doc(db, "Inventory", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating inventory: ", error);
            throw error;
        }
    }

    static async updateInventory(inventoryId, updatedInventory) {
        try {
            const docRef = doc(db, "Inventory", inventoryId);
            await updateDoc(docRef, updatedInventory);
        } catch (error) {
            console.error("Error updating inventory: ", error);
            throw error;
        }
    }

    static async deleteInventory(inventoryId) {
        try {
            const docRef = doc(db, "Inventory", inventoryId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting inventory: ", error);
            throw error;
        }
    }

    static async deleteInventories(inventoryId) {
        try {
            if (!Array.isArray(inventoryId)) {
                inventoryId = [inventoryId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = inventoryId.map(async (id) => {
                const docRef = doc(db, "Inventory", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting inventory: ", error);
            throw error;
        }
    }
}