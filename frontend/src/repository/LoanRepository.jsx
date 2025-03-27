import { addDoc, collection, deleteDoc, doc, getDoc, increment, onSnapshot, orderBy, query, Timestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase";
import EmployeeRepository from "./EmployeeRepository";

export default class LoansRepository {
    static getLoans(callback) {
        try {
            const loansQuery = query(collection(db, "Loans"), orderBy("startDate", "desc"));

            return onSnapshot(loansQuery, async (querySnapshot) => {
                const loans = await Promise.all(
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

                callback(loans);
            });
        } catch (error) {
            console.error("Error listening to loans: ", error);
        }
    }


    static async createLoans(loans) {
        try {
            await addDoc(collection(db, "Loans"), loans);
        } catch (error) {
            console.error("Error creating loans: ", error);
            throw error;
        }
    }

    static async updateLoans(loanId, updatedLoans) {
        try {
            const docRef = doc(db, "Loans", loanId);
            await updateDoc(docRef, updatedLoans);
        } catch (error) {
            console.error("Error updating loans: ", error);
            throw error;
        }
    }

    static async updateStatusPaymentLoans(
        loanId,
        amountFinalty,
        amountPayment,
        statusLoans,
        finaltyLoans,
        dateKey
    ) {
        try {
            const docRef = doc(db, "Loans", loanId);
    
            // 🔹 Update status pembayaran untuk bulan tertentu
            await updateDoc(docRef, {
                finalty: increment(amountFinalty),
                totalCompletePayment: increment(amountPayment),
                [`paymentLoans.${dateKey}.status`]: statusLoans,
                [`paymentLoans.${dateKey}.finalty`]: finaltyLoans,
                [`paymentLoans.${dateKey}.paymentDate`]: Timestamp.now(),
            });
    
            // 🔹 Ambil kembali data setelah update
            const updatedDoc = await getDoc(docRef);
            if (!updatedDoc.exists()) {
                console.error("Loan document not found");
                return;
            }
    
            const loanData = updatedDoc.data();
            const paymentLoans = loanData.paymentLoans || {};
    
            // 🔹 Cek apakah semua status paymentLoans sudah "selesai"
            const allPaymentsCompleted = Object.values(paymentLoans).every(p => p.status === "selesai");
    
            if (allPaymentsCompleted) {
                // 🔹 Jika semua selesai, update status utama loan menjadi "selesai"
                await updateDoc(docRef, {
                    status: "Lunas",
                });
            }
    
            // 🔹 Update Loans Employee setelah pembaruan sukses
            if (loanData.userId) {
                await EmployeeRepository.updateLoansEmployee(loanData.userId, -amountPayment);
            } else {
                console.error("User ID not found in loan data");
            }
        } catch (error) {
            console.error("Error updating payment status: ", error);
            throw error;
        }
    }

    static deleteLoanByIds = async (loanIds) => {
        try {
            for (const loanId of loanIds) {
                const docRef = doc(db, "Loans", loanId);
                await deleteDoc(docRef);
            }
        } catch (error) {
            console.error("Gagal menghapus data loan:", error);
            throw new Error("Error deleting loan");
        }
    };
    

    // static async deleteSaving(loanId) {
    //     try {
    //         const docRef = doc(db, "Loans", loanId);
    //         await deleteDoc(docRef);  // Delete the document from Firestore
    //     } catch (error) {
    //         console.error("Error deleting loans: ", error);
    //         throw error;
    //     }
    // }

    // static async deleteSavingCheckbox(loanId) {
    //     try {
    //         if (!Array.isArray(loanId)) {
    //             loanId = [loanId]; // Ubah jadi array jika bukan array
    //         }

    //         const deletePromises = loanId.map(async (empId) => {
    //             const docRef = doc(db, "Loans", empId);
    //             await deleteDoc(docRef);
    //         });

    //         await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
    //     } catch (error) {
    //         console.error("Error deleting loans: ", error);
    //         throw error;
    //     }
    // }
}