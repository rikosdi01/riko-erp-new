import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class CSORepository {
    static getCSO(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const CSOQuery = query(
                collection(db, "CSO"),
                orderBy("name")
            );

            return onSnapshot(CSOQuery, (querySnapshot) => {
                const CSO = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(CSO);
            });
        } catch (error) {
            console.error("Error listening to CSO: ", error);
        }
    }
}