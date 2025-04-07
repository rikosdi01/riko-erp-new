import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class AdjustmentRepository {
    static getAdjustment(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const adjustmentQuery = query(
                collection(db, "Adjustment"),
                orderBy("code", "desc")
            );

            return onSnapshot(adjustmentQuery, (querySnapshot) => {
                const adjustment = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(adjustment);
            });
        } catch (error) {
            console.error("Error listening to adjustment: ", error);
        }
    }
}