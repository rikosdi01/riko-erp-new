import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class CategoriesRepository {
    static subscribeToCategoriesChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Categories'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkCategoryCodeExists(categoryCode, merkCode, excludeId = null) {
        try {
            const q = query(
                collection(db, "Categories"),
                where("code", "==", categoryCode),
                where("merks.code", "==", merkCode),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getCategories(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const categoryQuery = query(
                collection(db, "Categories"),
                orderBy("name")
            );

            return onSnapshot(categoryQuery, (querySnapshot) => {
                const categories = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(categories);
            });
        } catch (error) {
            console.error("Error listening to categories: ", error);
        }
    }

    static async getCategoryById(categoryId) {
        try {
            const docRef = doc(db, "Categories", categoryId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching categories: ", error);
            throw error;
        }
    }

    static async createCategory(categories) {
        try {
            const docRef = await addDoc(collection(db, "Categories"), categories);
            await updateDoc(doc(db, "Categories", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating categories: ", error);
            throw error;
        }
    }

    static async updateCategory(categoryId, updatedCategory) {
        try {
            const docRef = doc(db, "Categories", categoryId);
            await updateDoc(docRef, updatedCategory);
        } catch (error) {
            console.error("Error updating categories: ", error);
            throw error;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const docRef = doc(db, "Categories", categoryId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting categories: ", error);
            throw error;
        }
    }

    static async deleteCategories(categoryId) {
        try {
            if (!Array.isArray(categoryId)) {
                categoryId = [categoryId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = categoryId.map(async (id) => {
                const docRef = doc(db, "Categories", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting categories: ", error);
            throw error;
        }
    }
}