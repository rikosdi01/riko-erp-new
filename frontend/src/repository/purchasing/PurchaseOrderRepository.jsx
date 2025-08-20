import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class PurchaseOrderRepository {
    static subscribeToPOChanges(callback) {
        const unsub = onSnapshot(collection(db, 'PurchasingOrder'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }
    static async checkPOExists(adjCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "PurchasingOrder"),
                where("code", "==", adjCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getPO(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const adjQuery = query(
                collection(db, "PurchasingOrder"),
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

    static async getPOById(adjId) {
        try {
            const docRef = doc(db, "PurchasingOrder", adjId);
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


    static async createPO(adj) {
        try {
            const docRef = await addDoc(collection(db, "PurchasingOrder"), adj);
            await updateDoc(doc(db, "PurchasingOrder", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating adj: ", error);
            throw error;
        }
    }

    static async updatePO(adjId, updatedAdj) {
        try {
            const docRef = doc(db, "PurchasingOrder", adjId);
            await updateDoc(docRef, updatedAdj);
        } catch (error) {
            console.error("Error updating adj: ", error);
            throw error;
        }
    }

    static async deletePO(adjId) {
        try {
            const docRef = doc(db, "PurchasingOrder", adjId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting adj: ", error);
            throw error;
        }
    }
}