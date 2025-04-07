import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class TransferRepository {
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
}