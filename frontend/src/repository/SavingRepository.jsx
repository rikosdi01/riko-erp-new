import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../firebase";
import EmployeeRepository from "./EmployeeRepository";

export default class SavingsRepository {
    static getSavings(callback) {
        try {
            const savingsQuery = query(collection(db, "Savings"), orderBy("date", "desc"));

            return onSnapshot(savingsQuery, async (querySnapshot) => {
                const savings = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();

                        const employeeData = await EmployeeRepository.getEmployeeById(data.userId);

                        return {
                            id: docSnapshot.id,
                            ...data,
                            employee: employeeData,
                        };
                    })
                );

                callback(savings);
            });
        } catch (error) {
            console.error("Error listening to savings: ", error);
        }
    }


    static async createSavings(savings) {
        try {
            await addDoc(collection(db, "Savings"), savings);
        } catch (error) {
            console.error("Error creating savings: ", error);
            throw error;
        }
    }

    static async updateSavings(savingId, updatedSavings) {
        try {
            const docRef = doc(db, "Savings", savingId);
            await updateDoc(docRef, updatedSavings);
        } catch (error) {
            console.error("Error updating savings: ", error);
            throw error;
        }
    }

    static deleteSavingsByIds = async (savingsIds) => {
        try {
            for (const savingsId of savingsIds) {
                const docRef = doc(db, "Savings", savingsId);
                await deleteDoc(docRef);
            }
        } catch (error) {
            console.error("Gagal menghapus data savings:", error);
            throw new Error("Error deleting savings");
        }
    };

    static async deleteSaving(savingId) {
        try {
            const docRef = doc(db, "Savings", savingId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting savings: ", error);
            throw error;
        }
    }

    static async deleteSavingCheckbox(savingId, savingType, employeeId, amountInt, monthKey) {
        try {
            if (!savingId) return;

            if (savingType === "Pemasukkan") {
                await EmployeeRepository.updateMonthlySavings(employeeId, amountInt, monthKey);
            }

            // Hapus dokumen savings di Firestore
            const docRef = doc(db, "Savings", savingId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting savings: ", error);
            throw error;
        }
    }
}