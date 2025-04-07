import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class CourierRepository {
    static getCourier(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const courierQuery = query(
                collection(db, "Couriers"),
                orderBy("name")
            );

            return onSnapshot(courierQuery, (querySnapshot) => {
                const couriers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(couriers);
            });
        } catch (error) {
            console.error("Error listening to couriers: ", error);
        }
    }
}