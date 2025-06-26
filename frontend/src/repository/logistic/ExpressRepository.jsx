import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class ExpressRepository {
    static getExpress(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const expressQueru = query(
                collection(db, "Express"),
                orderBy("name")
            );

            return onSnapshot(expressQueru, (querySnapshot) => {
                const express = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(express);
            });
        } catch (error) {
            console.error("Error listening to express: ", error);
        }
    }

    static async getExpressById(expressId) {
        try {
            const docRef = doc(db, "Express", expressId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching express: ", error);
            throw error;
        }
    }

    static async createExpress(express) {
        try {
            const docRef = await addDoc(collection(db, "Express"), express);
            await updateDoc(doc(db, "Express", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating express: ", error);
            throw error;
        }
    }

    static async updateExpress(expressId, updatedExpress) {
        try {
            const docRef = doc(db, "Express", expressId);
            await updateDoc(docRef, updatedExpress);
        } catch (error) {
            console.error("Error updating express: ", error);
            throw error;
        }
    }

    static async deleteExpress(expressId) {
        try {
            const docRef = doc(db, "Express", expressId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting express: ", error);
            throw error;
        }
    }

    static async deleteExpresss(expressId) {
        try {
            if (!Array.isArray(expressId)) {
                expressId = [expressId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = expressId.map(async (id) => {
                const docRef = doc(db, "Express", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting express: ", error);
            throw error;
        }
    }
}