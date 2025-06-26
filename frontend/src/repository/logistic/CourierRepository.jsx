import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class CourierRepository {
    static getCourier(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const courierQuery = query(
                collection(db, "Couriers"),
                orderBy("name")
            );

            return onSnapshot(courierQuery, (querySnapshot) => {
                const courier = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(courier);
            });
        } catch (error) {
            console.error("Error listening to courier: ", error);
        }
    }

    static async getCourierById(courierId) {
        try {
            const docRef = doc(db, "Couriers", courierId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching courier: ", error);
            throw error;
        }
    }

    static async createCourier(courier) {
        try {
            const docRef = await addDoc(collection(db, "Couriers"), courier);
            await updateDoc(doc(db, "Couriers", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating courier: ", error);
            throw error;
        }
    }

    static async updateCourier(courierId, updatedCourier) {
        try {
            const docRef = doc(db, "Couriers", courierId);
            await updateDoc(docRef, updatedCourier);
        } catch (error) {
            console.error("Error updating courier: ", error);
            throw error;
        }
    }

    static async deleteCourier(courierId) {
        try {
            const docRef = doc(db, "Couriers", courierId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting courier: ", error);
            throw error;
        }
    }

    static async deleteCouriers(courierId) {
        try {
            if (!Array.isArray(courierId)) {
                courierId = [courierId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = courierId.map(async (id) => {
                const docRef = doc(db, "Couriers", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting courier: ", error);
            throw error;
        }
    }
}