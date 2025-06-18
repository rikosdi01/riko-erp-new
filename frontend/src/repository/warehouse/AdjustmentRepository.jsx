import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class AdjustmentRepository {
    static async checkAdjExists(adjCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "Adjustment"),
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

    static getAdj(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const adjQuery = query(
                collection(db, "Adjustment"),
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

    static async getAdjById(adjId) {
        try {
            const docRef = doc(db, "Adjustment", adjId);
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


    static async createAdj(adj) {
        try {
            const docRef = await addDoc(collection(db, "Adjustment"), adj);
            await updateDoc(doc(db, "Adjustment", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating adj: ", error);
            throw error;
        }
    }

    static async updateAdj(adjId, updatedAdj) {
        try {
            const docRef = doc(db, "Adjustment", adjId);
            await updateDoc(docRef, updatedAdj);
        } catch (error) {
            console.error("Error updating adj: ", error);
            throw error;
        }
    }

    static async deleteAdj(adjId) {
        try {
            const docRef = doc(db, "Adjustment", adjId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting adj: ", error);
            throw error;
        }
    }
}