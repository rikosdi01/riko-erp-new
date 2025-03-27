import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../firebase";

export default class SettingsRepository {
    static getSettings(callback) {
        try {
            // Ambil referensi dokumen `adminSettings` di koleksi `Settings`
            const settingsRef = doc(db, "Settings", "adminSettings");
    
            // Dengarkan perubahan real-time pada dokumen
            return onSnapshot(settingsRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    callback({ id: docSnapshot.id, ...docSnapshot.data() });
                } else {
                    callback(null); // Jika dokumen tidak ditemukan
                }
            });
        } catch (error) {
            console.error("Error listening to settings: ", error);
        }
    }

    static async createSettings(settings) {
        try {
            await addDoc(collection(db, "Settings"), settings);
        } catch (error) {
            console.error("Error creating settings: ", error);
            throw error;
        }
    }

    static async updateSetting(updatedSettings) {
        try {
            const docRef = doc(db, "Settings", "adminSettings");
            await updateDoc(docRef, updatedSettings);
        } catch (error) {
            console.error("Error updating settings: ", error);
            throw error;
        }
    }

    static async deleteSetting(settingId) {
        try {
            const docRef = doc(db, "Settings", settingId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting settings: ", error);
            throw error;
        }
    }
}