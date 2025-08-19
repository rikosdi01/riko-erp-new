import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class RackWarehouseRepository {
    static subscribeToRackChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Warehouse'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkExistsRackName(rackName, rackLocation, excludeId = null) {
        try {
            const q = query(
                collection(db, "Warehouse"),
                where("name", "==", rackName),
                where("location", "==", rackLocation),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking merk existence: ", error);
            throw error
        }
    }

    static getRacks(callback, location = null) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const racksQuery = query(
                collection(db, "Warehouse"),
                orderBy("name"),
                where("location", "==", location)
            );

            return onSnapshot(racksQuery, (querySnapshot) => {
                const racks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(racks);
            });
        } catch (error) {
            console.error("Error listening to racks: ", error);
        }
    }

    static async getRackById(rackId) {
        try {
            const docRef = doc(db, "Warehouse", rackId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching racks: ", error);
            throw error;
        }
    }

    static async createRacks(racks) {
        try {
            const docRef = await addDoc(collection(db, "Warehouse"), racks);
            await updateDoc(doc(db, "Warehouse", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating racks: ", error);
            throw error;
        }
    }

    static async updateRack(rackId, updatedRack) {
        try {
            const docRef = doc(db, "Warehouse", rackId);
            await updateDoc(docRef, updatedRack);
        } catch (error) {
            console.error("Error updating racks: ", error);
            throw error;
        }
    }

    static async deleteRack(rackId) {
        try {
            const docRef = doc(db, "Warehouse", rackId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting racks: ", error);
            throw error;
        }
    }

    static async deleteRacks(rackId) {
        try {
            if (!Array.isArray(rackId)) {
                rackId = [rackId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = rackId.map(async (id) => {
                const docRef = doc(db, "Warehouse", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting racks: ", error);
            throw error;
        }
    }
}