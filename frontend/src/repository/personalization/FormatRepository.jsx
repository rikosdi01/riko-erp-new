import { collection, doc, getDoc, query, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default class PersonalRepository {
    static async getFormatSettingsByID() {
        try {
            const docRef = doc(db, "Settings", "formatDefault");
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

    static async createFormatSettings(docData, data) {
        try {
            const userRef = doc(db, "Settings", docData);
            return await setDoc(userRef, data);
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
}