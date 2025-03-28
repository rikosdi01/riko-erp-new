import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class SalesmanRepository {
    static getSalesman(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const salesmanQuery = query(
                collection(db, "Salesman"),
                orderBy("name")
            );

            return onSnapshot(salesmanQuery, (querySnapshot) => {
                const salesman = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(salesman);
            });
        } catch (error) {
            console.error("Error listening to salesman: ", error);
        }
    }

    static async getSalesmanById(salesmanId) {
        try {
            const docRef = doc(db, "Salesman", salesmanId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching salesman: ", error);
            throw error;
        }
    }

    static async createSalesman(salesman) {
        try {
            const docRef = await addDoc(collection(db, "Salesman"), salesman);
            await updateDoc(doc(db, "Salesman", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating salesman: ", error);
            throw error;
        }
    }

    static async updateSalesman(salesmanId, updatedSalesman) {
        try {
            const docRef = doc(db, "Salesman", salesmanId);
            await updateDoc(docRef, updatedSalesman);
        } catch (error) {
            console.error("Error updating salesman: ", error);
            throw error;
        }
    }

    static async deleteSalesman(salesmanId) {
        try {
            const docRef = doc(db, "Salesman", salesmanId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting salesman: ", error);
            throw error;
        }
    }

    static async deleteSalesmans(salesmanId) {
        try {
            if (!Array.isArray(salesmanId)) {
                salesmanId = [salesmanId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = salesmanId.map(async (id) => {
                const docRef = doc(db, "Salesman", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting salesman: ", error);
            throw error;
        }
    }
}