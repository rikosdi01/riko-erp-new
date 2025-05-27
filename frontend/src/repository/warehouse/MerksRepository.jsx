import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class MerksRepository {
    static async checkMerkCodeExists(merkCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "Merks"),
                where("code", "==", merkCode),
                limit(1)
            );
            
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking merk existence: ", error);
            throw error
        }
    }
    
    static getMerks(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const merksQuery = query(
                collection(db, "Merks"),
                orderBy("name")
            );

            return onSnapshot(merksQuery, (querySnapshot) => {
                const merks = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(merks);
            });
        } catch (error) {
            console.error("Error listening to merks: ", error);
        }
    }

    static async getMerksById(merkId) {
        try {
            const docRef = doc(db, "Merks", merkId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching merks: ", error);
            throw error;
        }
    }

    static async createMerk(merks) {
        try {
            const docRef = await addDoc(collection(db, "Merks"), merks);
            await updateDoc(doc(db, "Merks", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating merks: ", error);
            throw error;
        }
    }

    static async updateMerk(merkId, updatedMerk) {
        try {
            const docRef = doc(db, "Merks", merkId);
            await updateDoc(docRef, updatedMerk);
        } catch (error) {
            console.error("Error updating merks: ", error);
            throw error;
        }
    }

    static async deleteMerk(merkId) {
        try {
            const docRef = doc(db, "Merks", merkId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting merks: ", error);
            throw error;
        }
    }

    static async deleteMerks(merkId) {
        try {
            if (!Array.isArray(merkId)) {
                merkId = [merkId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = merkId.map(async (id) => {
                const docRef = doc(db, "Merks", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting merks: ", error);
            throw error;
        }
    }
}