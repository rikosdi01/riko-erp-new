import { addDoc, collection, deleteDoc, doc, getDoc, increment, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore"
import { db } from "../firebase";

export default class EmployeeRepository {
    static getEmployee(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const employeeQuery = query(
                collection(db, "Employee"),
                where("isActive", "==", true),
                orderBy("name")
            );

            return onSnapshot(employeeQuery, (querySnapshot) => {
                const employee = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(employee);
            });
        } catch (error) {
            console.error("Error listening to employee: ", error);
        }
    }

    static async getEmployeeById(employeeId) {
        try {
            const docRef = doc(db, "Employee", employeeId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching employee: ", error);
            throw error;
        }
    }

    static async createEmployee(employee) {
        try {
            const docRef = await addDoc(collection(db, "Employee"), employee);
            await updateDoc(doc(db, "Employee", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating employee: ", error);
            throw error;
        }
    }

    static async updateEmployee(employeeId, updatedEmployee) {
        try {
            const docRef = doc(db, "Employee", employeeId);
            await updateDoc(docRef, updatedEmployee);
        } catch (error) {
            console.error("Error updating employee: ", error);
            throw error;
        }
    }

    static async updateMonthlySavings(employeeId, amountInt, monthKey) {
        try {
            const docRef = doc(db, "Employee", employeeId);
            await updateDoc(docRef, {
                [`monthlyTotals.${monthKey}`]: increment(amountInt)
            });
        } catch (error) {
            console.error("Error updating employee: ", error);
            throw error;
        }
    }

    static async updateLoansEmployee(employeeId, amountInt) {
        try {
            const docRef = doc(db, "Employee", employeeId);
            await updateDoc(docRef, {
                loanBalance: increment(amountInt)
            });
        } catch (error) {
            console.error("Error updating employee: ", error);
            throw error;
        }
    }


    static async deleteEmployee(employeeId) {
        try {
            const docRef = doc(db, "Employee", employeeId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting employee: ", error);
            throw error;
        }
    }

    static async deleteEmployeeCheckbox(employeeId) {
        try {
            if (!Array.isArray(employeeId)) {
                employeeId = [employeeId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = employeeId.map(async (empId) => {
                const docRef = doc(db, "Employee", empId);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting employee: ", error);
            throw error;
        }
    }
}