import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase";

export default class RolesRepository {
    static getRoles(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const roleQuery = query(
                collection(db, "Roles"),
                orderBy("name")
            );

            return onSnapshot(roleQuery, (querySnapshot) => {
                const role = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(role);
            });
        } catch (error) {
            console.error("Error listening to role: ", error);
        }
    }

    static async getRoleByID(roleName) {
        try {
            const docRef = doc(db, "Roles", roleName);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching role: ", error);
            throw error;
        }
    }

    static async createRole(role) {
        const docId = role.name.toLowerCase().replace(/\s+/g, '-'); // kebab-case
        const roleRef = doc(db, "Roles", docId);

        const existing = await getDoc(roleRef);
        if (existing.exists()) {
            return false; // Sudah ada
        }

        await setDoc(roleRef, {
            name: role.name,
            accessData: role.accessData || [],
            createdAt: new Date(),
        });

        return true;
    }


    static async updateAccessData(roleName, accessData) {
        try {
            const docId = roleName.toLowerCase().replace(/\s+/g, '-');
            const userRef = doc(db, "Roles", docId);

            await updateDoc(userRef, {
                accessData: accessData
            });
        } catch (error) {
            console.error("Error updating access data: ", error);
            throw error;
        }
    }

    static async renameRole(oldName, newName) {
        const oldDocId = oldName.toLowerCase().replace(/\s+/g, '-');
        const newDocId = newName.toLowerCase().replace(/\s+/g, '-');

        const oldDocRef = doc(db, "Roles", oldDocId);
        const newDocRef = doc(db, "Roles", newDocId);

        const oldSnapshot = await getDoc(oldDocRef);

        if (!oldSnapshot.exists()) {
            throw new Error(`Role "${oldName}" tidak ditemukan.`);
        }

        const existingNew = await getDoc(newDocRef);
        if (existingNew.exists()) {
            throw new Error(`Role "${newName}" sudah ada.`);
        }

        const oldData = oldSnapshot.data();

        // Buat dokumen baru
        await setDoc(newDocRef, {
            ...oldData,
            name: newName,
        });

        // Hapus dokumen lama
        await deleteDoc(oldDocRef);
    }

    static async deleteRole(roleName) {
        const docId = roleName.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(db, "Roles", docId);

        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
            throw new Error(`Role "${roleName}" tidak ditemukan.`);
        }

        await deleteDoc(docRef);
    }

}