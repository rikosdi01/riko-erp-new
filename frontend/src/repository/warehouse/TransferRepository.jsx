import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class TransferRepository {
    static async checkTransferExists(transferCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "Transfer"),
                where("code", "==", transferCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getTransfer(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const transferQuery = query(
                collection(db, "Transfer"),
                orderBy("code", "desc")
            );

            return onSnapshot(transferQuery, (querySnapshot) => {
                const transfer = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(transfer);
            });
        } catch (error) {
            console.error("Error listening to transfer: ", error);
        }
    }

    static async getTransferById(transferId) {
        try {
            const docRef = doc(db, "Transfer", transferId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching transfer: ", error);
            throw error;
        }
    }


    static async createTransfer(transfer) {
        try {
            const docRef = await addDoc(collection(db, "Transfer"), transfer);
            await updateDoc(doc(db, "Transfer", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating transfer: ", error);
            throw error;
        }
    }

    static async updateTransfer(transferId, updatedTransfer) {
        try {
            const docRef = doc(db, "Transfer", transferId);
            await updateDoc(docRef, updatedTransfer);
        } catch (error) {
            console.error("Error updating transfer: ", error);
            throw error;
        }
    }

    static async deleteTransfer(transferId) {
        try {
            const docRef = doc(db, "Transfer", transferId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting transfer: ", error);
            throw error;
        }
    }
}