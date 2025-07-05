import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class SalesOrderRepository {
    static subscribeToSalesOrderChanges(callback) {
        const unsub = onSnapshot(collection(db, 'SalesOrder'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkSalesOrderExists(soCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "SalesOrder"),
                where("code", "==", soCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getSalesOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const salesOrderQuery = query(
                collection(db, "SalesOrder"),
                orderBy("createdAt")
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

    static async updateValueAfterPrint(salesOrderId) {
        console.log('Sales Order ID: ', salesOrderId);
        try {
            const docRef = doc(db, "SalesOrder", salesOrderId); // sesuaikan path koleksi
            await updateDoc(docRef, { isPrint: true });
            console.log("Status isPrint berhasil diupdate.");
        } catch (error) {
            console.error("Gagal update isPrint:", error);
        }
    };

    static async updateStatusValue(salesOrderId, status) {
        try {
            const docRef = doc(db, "SalesOrder", salesOrderId); // sesuaikan path koleksi
            await updateDoc(docRef, { status: status });
            console.log("Status Pesanan berhasil diupdate.");
        } catch (error) {
            console.error("Gagal update isPrint:", error);
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