import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class InvoiceRepository {
    static getInvoice(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const invoiceQuery = query(
                collection(db, "Invoice"),
                orderBy("createdAt")
            );

            return onSnapshot(invoiceQuery, (querySnapshot) => {
                const invoice = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(invoice);
            });
        } catch (error) {
            console.error("Error listening to invoice: ", error);
        }
    }

    

    static async updateStatusValue(deliveryOrderId, status) {
        try {
            const docRef = doc(db, "Invoice", deliveryOrderId); // sesuaikan path koleksi
            await updateDoc(docRef, { statusPayment: status });
            console.log("Status Pesanan berhasil diupdate.");
        } catch (error) {
            console.error("Gagal update isPrint:", error);
        }
    }
}