import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class ExpressRepository {
    static getExpress(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const expressQuery = query(
                collection(db, "Express"),
                orderBy("name")
            );

            return onSnapshot(expressQuery, (querySnapshot) => {
                const express = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(express);
            });
        } catch (error) {
            console.error("Error listening to express: ", error);
        }
    }
}