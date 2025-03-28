import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class SalesOrderRepository {
    static getSalesOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const salesOrderQuery = query(
                collection(db, "SalesOrder"),
                orderBy("name")
            );

            return onSnapshot(salesOrderQuery, (querySnapshot) => {
                const salesOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(salesOrder);
            });
        } catch (error) {
            console.error("Error listening to salesOrder: ", error);
        }
    }

    static async getSalesOrderById(salesOrderId) {
        try {
            const docRef = doc(db, "SalesOrder", salesOrderId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching salesOrder: ", error);
            throw error;
        }
    }

    static async createSalesOrder(salesOrder) {
        try {
            const docRef = await addDoc(collection(db, "SalesOrder"), salesOrder);
            await updateDoc(doc(db, "SalesOrder", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating salesOrder: ", error);
            throw error;
        }
    }

    static async updateSalesOrder(salesOrderId, updatedSalesOrder) {
        try {
            const docRef = doc(db, "SalesOrder", salesOrderId);
            await updateDoc(docRef, updatedSalesOrder);
        } catch (error) {
            console.error("Error updating salesOrder: ", error);
            throw error;
        }
    }

    static async deleteSalesOrder(salesOrderId) {
        try {
            const docRef = doc(db, "SalesOrder", salesOrderId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting salesOrder: ", error);
            throw error;
        }
    }

    static async deleteSalesOrders(salesOrderId) {
        try {
            if (!Array.isArray(salesOrderId)) {
                salesOrderId = [salesOrderId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = salesOrderId.map(async (id) => {
                const docRef = doc(db, "SalesOrder", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting salesOrder: ", error);
            throw error;
        }
    }
}