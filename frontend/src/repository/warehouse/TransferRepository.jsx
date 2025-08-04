import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from "firebase/firestore"
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

    static async getTransferBySOCode(soCode) {
        try {
            const transferQuery = query(
                collection(db, "Transfer"),
                where("soCode", "==", soCode)
            );

            const querySnapshot = await getDocs(transferQuery);

            if (querySnapshot.empty) return null;

            // Asumsikan hanya satu transfer per soCode
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
            };
        } catch (error) {
            console.error("Error getting transfer by SO code: ", error);
            return null;
        }
    }

    static async getTransferById(transferId) {
        try {
            const docRef = doc(db, "Transfer", transferId);
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists()) {
                return null;
            }

            const transferData = docSnapshot.data();

            // Ambil subkoleksi Items
            const itemsColRef = collection(db, "Transfer", transferId, "Items");
            const itemsSnap = await getDocs(itemsColRef);
            const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return {
                id: docSnapshot.id,
                ...transferData,
                items, // masukkan items sebagai bagian dari data
            };
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
            const { items, ...transferData } = updatedTransfer;
            const docRef = doc(db, "Transfer", transferId);

            // 1. Update data utama (tanpa items)
            await updateDoc(docRef, transferData);

            // 2. Hapus semua item lama
            const itemsRef = collection(docRef, "Items");
            const snapshot = await getDocs(itemsRef);

            const batch = writeBatch(db);

            snapshot.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });

            // 3. Simpan ulang items baru
            items.forEach(item => {
                const itemDoc = doc(itemsRef); // auto ID
                batch.set(itemDoc, item);
            });

            await batch.commit();
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