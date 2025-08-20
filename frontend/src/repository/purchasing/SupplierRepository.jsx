import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class SupplierRepository {
    static subscribeToSupplierChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Supplier'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }
    static async checkSupplierExists(name, email, excludeId = null) {
        try {
            const q = query(
                collection(db, "Supplier"),
                where("name", "==", name),
                where("email", "==", email),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getSupplier(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const adjQuery = query(
                collection(db, "Supplier"),
                orderBy("code", "desc")
            );

            return onSnapshot(adjQuery, (querySnapshot) => {
                const adj = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(adj);
            });
        } catch (error) {
            console.error("Error listening to adj: ", error);
        }
    }

    static async getSupplierById(adjId) {
        try {
            const docRef = doc(db, "Supplier", adjId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching adj: ", error);
            throw error;
        }
    }


    static async createSupplier(adj) {
        try {
            const docRef = await addDoc(collection(db, "Supplier"), adj);
            await updateDoc(doc(db, "Supplier", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating adj: ", error);
            throw error;
        }
    }

    static async updateSupplier(adjId, updatedAdj) {
        try {
            const docRef = doc(db, "Supplier", adjId);
            await updateDoc(docRef, updatedAdj);
        } catch (error) {
            console.error("Error updating adj: ", error);
            throw error;
        }
    }

    static async deleteSupplier(adjId) {
        try {
            const docRef = doc(db, "Supplier", adjId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting adj: ", error);
            throw error;
        }
    }
}