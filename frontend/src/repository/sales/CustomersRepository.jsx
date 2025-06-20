import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class CustomersRepository {
    static subscribeToCustomersChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Customers'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static getCustomers(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const customerQuery = query(
                collection(db, "Customers"),
                orderBy("name")
            );

            return onSnapshot(customerQuery, (querySnapshot) => {
                const customers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(customers);
            });
        } catch (error) {
            console.error("Error listening to customers: ", error);
        }
    }

    static async getCustomersById(customerId) {
        try {
            const docRef = doc(db, "Customers", customerId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching customers: ", error);
            throw error;
        }
    }

    static async createCustomers(customers) {
        try {
            const docRef = await addDoc(collection(db, "Customers"), customers);
            await updateDoc(doc(db, "Customers", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating customers: ", error);
            throw error;
        }
    }

    static async updateCustomers(customerId, updatedCustomers) {
        try {
            const docRef = doc(db, "Customers", customerId);
            await updateDoc(docRef, updatedCustomers);
        } catch (error) {
            console.error("Error updating customers: ", error);
            throw error;
        }
    }

    static async deleteCustomer(customerId) {
        try {
            const docRef = doc(db, "Customers", customerId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting customers: ", error);
            throw error;
        }
    }

    static async deleteCustomers(customerId) {
        try {
            if (!Array.isArray(customerId)) {
                customerId = [customerId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = customerId.map(async (id) => {
                const docRef = doc(db, "Customers", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting customers: ", error);
            throw error;
        }
    }
}