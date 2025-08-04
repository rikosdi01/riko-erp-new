import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload file ke Firebase Storage & kembalikan URL-nya.
 * @param {File} file - File yang akan di-upload
 * @param {string} path - Path di Firebase Storage
 * @returns {Promise<string>} - URL dari file yang berhasil diupload
 */
const uploadFileAndGetURL = async (file, path) => {
    try {
        const storage = getStorage();
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        return url;
    } catch (error) {
        console.error("Gagal upload file ke Firebase Storage:", error);
        throw error;
    }
};

export default uploadFileAndGetURL;