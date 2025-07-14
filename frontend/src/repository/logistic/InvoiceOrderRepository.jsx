import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class InvoiceOrderRepository {
    static subscribeToInvoiceOrderChanges(callback) {
        const unsub = onSnapshot(collection(db, 'InvoiceOrder'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    // static async checkInvoiceOrderExists(invoiceCode, excludeId = null) {
    //     try {
    //         const q = query(
    //             collection(db, "Invoice"),
    //             where("code", "==", invoiceCode),
    //             limit(1)
    //         );

    //         const querySnapshot = await getDocs(q);

    //         return querySnapshot.docs.some(doc => doc.id !== excludeId);
    //     } catch (error) {
    //         console.error("Error checking invoice order existence: ", error);
    //         throw error
    //     }
    // }

    static getInvoiceOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const invoiceOrderQuery = query(
                collection(db, "Invoice"),
                orderBy("createdAt")
            );

            return onSnapshot(invoiceOrderQuery, (querySnapshot) => {
                const invoiceOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(invoiceOrder);
            });
        } catch (error) {
            console.error("Error listening to invoice order: ", error);
        }
    }

    static async getInvoiceOrderById(invoiceOrderId) {
        try {
            const docRef = doc(db, "Invoice", invoiceOrderId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching invoice order: ", error);
            throw error;
        }
    }

    static async createInvoiceOrder(invoiceOrder) {
        console.log('Invoice Order: ', invoiceOrder);
        try {
            const docRef = await addDoc(collection(db, "Invoice"), invoiceOrder);
            await updateDoc(doc(db, "Invoice", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating invoice order: ", error);
            throw error;
        }
    }

    static async updateInvoiceOrder(invoiceOrderId, updateInvoiceOrder) {
        try {
            const docRef = doc(db, "Invoice", invoiceOrderId);
            await updateDoc(docRef, updateInvoiceOrder);
        } catch (error) {
            console.error("Error updating invoice order: ", error);
            throw error;
        }
    }

    static async updateStatusInvoiceOrder(invoiceOrderId, newStatus) {
        try {
            const docRef = doc(db, "Invoice", invoiceOrderId);
            await updateDoc(docRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating invoice order: ", error);
            throw error;
        }
    }

    static async deleteInvoiceOrder(invoiceOrderId) {
        try {
            const docRef = doc(db, "Invoice", invoiceOrderId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting invoice order: ", error);
            throw error;
        }
    }

    static async deleteInvoiceOrders(invoiceOrderId) {
        try {
            if (!Array.isArray(invoiceOrderId)) {
                invoiceOrderId = [invoiceOrderId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = invoiceOrderId.map(async (id) => {
                const docRef = doc(db, "Invoice", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting invoice order: ", error);
            throw error;
        }
    }
}