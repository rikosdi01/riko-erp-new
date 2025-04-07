import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class ReturnOrderRepository {
    static getReturnOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const returnOrderQuery = query(
                collection(db, "ReturnOrder"),
                orderBy("createdAt")
            );

            return onSnapshot(returnOrderQuery, (querySnapshot) => {
                const returnOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(returnOrder);
            });
        } catch (error) {
            console.error("Error listening to returnOrder: ", error);
        }
    }
}