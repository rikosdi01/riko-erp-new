import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class DeliveryOrderRepository {
    static subscribeToDeliveryOrderChanges(callback) {
        const unsub = onSnapshot(collection(db, 'DeliveryOrder'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkDeliveryOrderExists(soCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "DeliveryOrder"),
                where("code", "==", soCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking delivery order existence: ", error);
            throw error
        }
    }
    static getDeliveryOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const deliveryOrderQuery = query(
                collection(db, "DeliveryOrder"),
                orderBy("createdAt")
            );

            return onSnapshot(deliveryOrderQuery, (querySnapshot) => {
                const deliveryOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(deliveryOrder);
            });
        } catch (error) {
            console.error("Error listening to delivery order: ", error);
        }
    }

    static async getDeliveryOrderById(deliveryOrderId) {
        try {
            const docRef = doc(db, "DeliveryOrder", deliveryOrderId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching delivery order: ", error);
            throw error;
        }
    }

    static async createDeliveryOrder(deliveryOrder) {
        console.log('Delivery Order: ', deliveryOrder);
        try {
            const docRef = await addDoc(collection(db, "DeliveryOrder"), deliveryOrder);
            await updateDoc(doc(db, "DeliveryOrder", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating delivery order: ", error);
            throw error;
        }
    }

    static async updateDeliveryOrder(deliveryOrderId, updateDeliveryOrder) {
        try {
            const docRef = doc(db, "DeliveryOrder", deliveryOrderId);
            await updateDoc(docRef, updateDeliveryOrder);
        } catch (error) {
            console.error("Error updating delivery order: ", error);
            throw error;
        }
    }

    static async deleteDeliveryOrder(deliveryOrderId) {
        try {
            const docRef = doc(db, "DeliveryOrder", deliveryOrderId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting delivery order: ", error);
            throw error;
        }
    }

    static async deleteDeliveryOrders(deliveryOrderId) {
        try {
            if (!Array.isArray(deliveryOrderId)) {
                deliveryOrderId = [deliveryOrderId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = deliveryOrderId.map(async (id) => {
                const docRef = doc(db, "DeliveryOrder", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting delivery order: ", error);
            throw error;
        }
    }
}