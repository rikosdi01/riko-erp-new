import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class UserRepository {
    static getUsers(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const userQuery = query(
                collection(db, "Users"),
                orderBy("username")
            );

            return onSnapshot(userQuery, (querySnapshot) => {
                const user = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(user);
            });
        } catch (error) {
            console.error("Error listening to user: ", error);
        }
    }

    static async getUserByUID(userId) {
        try {
            const docRef = doc(db, "Users", userId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user: ", error);
            throw error;
        }
    }

    static async createUser(user) {
        try {
            const userRef = doc(db, "Users", user.uid);
            await setDoc(userRef, { ...user });
            return user.uid;
        } catch (error) {
            console.error("Error creating user: ", error);
            throw error;
        }
    }

    // ✅ Jadikan method ini static
    static async getRoleAccess(roleName) {
        try {
            const formattedName = roleName.toLowerCase().replace(/\s+/g, '-');
            console.log('formattedName: ', formattedName);
            return await getDoc(doc(db, "Roles", formattedName));
        } catch (error) {
            console.error("Error fetching role access: ", error);
            throw error;
        }
    }

    static async updateAccessData(userId, accessData) {
        try {
            const userRef = doc(db, "Users", userId);
            await updateDoc(userRef, {
                accessData: accessData
            });
        } catch (error) {
            console.error("Error updating access data: ", error);
            throw error;
        }
    }

    static async updateUserData(userId, updatedUser) {
        try {
            const docRef = doc(db, "Users", userId);
            await updateDoc(docRef, updatedUser);
        } catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    }

    static async deleteCourier(userId) {
        try {
            const docRef = doc(db, "Users", userId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting user: ", error);
            throw error;
        }
    }

    static async deleteCouriers(userId) {
        try {
            if (!Array.isArray(userId)) {
                userId = [userId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = userId.map(async (id) => {
                const docRef = doc(db, "Users", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting user: ", error);
            throw error;
        }
    }
}