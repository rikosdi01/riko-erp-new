import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class InventoryRepository {
    static getInventory(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const invetoryQuery = query(
                collection(db, "Inventory"),
                orderBy("name")
            );

            return onSnapshot(invetoryQuery, (querySnapshot) => {
                const invetory = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(invetory);
            });
        } catch (error) {
            console.error("Error listening to invetory: ", error);
        }
    }
}