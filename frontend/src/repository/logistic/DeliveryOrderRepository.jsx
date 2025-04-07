import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class DeliveryOrderRepository {
    static getDeliveryOrder(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const deliveryOrderQuery = query(
                collection(db, "DeliveryOrder"),
                orderBy("createdAt")
            );

            return onSnapshot(deliveryOrderQuery, (querySnapshot) => {
                const deliveryOrder = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(deliveryOrder);
            });
        } catch (error) {
            console.error("Error listening to deliveryOrder: ", error);
        }
    }
}