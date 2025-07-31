import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class BackOrderRepository {
    static subscribeToBackOrderChanges(callback) {
        const unsub = onSnapshot(collection(db, 'BackOrder'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkBackOrderExists(boCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "BackOrder"),
                where("code", "==", boCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getBackOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const backOrderQuery = query(
                collection(db, "BackOrder"),
                orderBy("createdAt")
            );

            return onSnapshot(backOrderQuery, (querySnapshot) => {
                const backOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(backOrder);
            });
        } catch (error) {
            console.error("Error listening to backOrder: ", error);
        }
    }

    static async getBackOrderById(backOrderId) {
        try {
            const docRef = doc(db, "BackOrder", backOrderId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching backOrder: ", error);
            throw error;
        }
    }

    static async createBackOrder(backOrder) {
        try {
            const docRef = await addDoc(collection(db, "BackOrder"), backOrder);
            await updateDoc(doc(db, "BackOrder", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating backOrder: ", error);
            throw error;
        }
    }

    static async updateBackOrder(backOrderId, updatedBackOrder) {
        try {
            const docRef = doc(db, "BackOrder", backOrderId);
            await updateDoc(docRef, updatedBackOrder);
        } catch (error) {
            console.error("Error updating backOrder: ", error);
            throw error;
        }
    }

    static async updateStatusValue(backOrderId, status) {
        try {
            const docRef = doc(db, "BackOrder", backOrderId); // sesuaikan path koleksi
            await updateDoc(docRef, { status: status });
            console.log("Status Pesanan berhasil diupdate.");
        } catch (error) {
            console.error("Gagal update isPrint:", error);
        }
    }

    static async deleteBackOrder(backOrderId) {
        try {
            const docRef = doc(db, "BackOrder", backOrderId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting backOrder: ", error);
            throw error;
        }
    }

    static async deleteBackOrders(backOrderId) {
        try {
            if (!Array.isArray(backOrderId)) {
                backOrderId = [backOrderId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = backOrderId.map(async (id) => {
                const docRef = doc(db, "BackOrder", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting backOrder: ", error);
            throw error;
        }
    }
}