import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore"
import { db } from "../../firebase";

export default class ItemsRepository {
    static subscribeToItemsChanges(callback) {
        const unsub = onSnapshot(collection(db, 'Items'), (snapshot) => {
            callback(snapshot);
        });

        return unsub; // kembalikan function unsubscribe supaya bisa cleanup di frontend
    }

    static async checkItemsExists(itemCode, categoryId, excludeId = null) {
        try {
            const q = query(
                collection(db, "Items"),
                where("code", "==", itemCode),
                where("category.id", "==", categoryId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.some(doc => doc.id !== excludeId);
        } catch (error) {
            console.error("Error checking category existence: ", error);
            throw error
        }
    }

    static getItems(callback) {
        try {
            // Query Firestore untuk mengurutkan berdasarkan 'name'
            const itemsQuery = query(
                collection(db, "Items"),
                orderBy("name")
            );

            return onSnapshot(itemsQuery, (querySnapshot) => {
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                callback(items);
            });
        } catch (error) {
            console.error("Error listening to items: ", error);
        }
    }

    static async getItemsById(itemId) {
        try {
            const docRef = doc(db, "Items", itemId);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                return { id: docSnapshot.id, ...docSnapshot.data() };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching items: ", error);
            throw error;
        }
    }

    static async createItem(items) {
        try {
            const docRef = await addDoc(collection(db, "Items"), items);
            await updateDoc(doc(db, "Items", docRef.id), { id: docRef.id });
            return docRef.id;
        } catch (error) {
            console.error("Error creating items: ", error);
            throw error;
        }
    }

    static async updateItem(itemId, updatedItem) {
        try {
            const docRef = doc(db, "Items", itemId);
            await updateDoc(docRef, updatedItem);
        } catch (error) {
            console.error("Error updating items: ", error);
            throw error;
        }
    }

    static async updateStockOrder(itemId, updatedStock) {
        try {
            const docRef = doc(db, 'Items', itemId);
            await updateDoc(docRef, {
                stock: updatedStock,
                updatedAt: serverTimestamp(),
            })
        } catch (error) {
            console.error("Error updating items: ", error);
            throw error;
        }
    }

    static async overwriteItemStock(itemId, newQty, userLocation) {
        try {
            const itemRef = doc(db, "Items", itemId);
            const itemSnap = await getDoc(itemRef);

            if (!itemSnap.exists()) {
                throw new Error(`Item ${itemId} not found`);
            }

            const data = itemSnap.data();
            const currentStock = data.stock || {};

            // Overwrite hanya lokasi tertentu (misalnya 'medan' atau 'jakarta')
            const updatedStock = {
                ...currentStock,
                [userLocation]: newQty
            };

            await updateDoc(itemRef, {
                stock: updatedStock,
                updatedAt: new Date()
            });

        } catch (error) {
            console.error(`Error overwriting stock for item ${itemId}:`, error);
            throw error;
        }
    }


    static async adjustItemStock(itemId, qtyToAdjust, rackName) {
        try {
            const itemRef = doc(db, "Items", itemId);
            const itemSnap = await getDoc(itemRef);

            if (!itemSnap.exists()) {
                throw new Error(`Item ${itemId} not found`);
            }

            const data = itemSnap.data();
            const racks = data.racks || [];

            // Cari rack
            const existingRackIndex = racks.findIndex(r => r.rack === rackName);

            if (existingRackIndex !== -1) {
                // Update stok rack yang sudah ada
                racks[existingRackIndex].stock += qtyToAdjust;

                // Jika hasilnya 0 atau negatif, bisa dihapus atau dibiarkan (opsional)
                if (racks[existingRackIndex].stock <= 0) {
                    racks.splice(existingRackIndex, 1); // hapus rack tersebut
                }
            } else if (qtyToAdjust > 0) {
                // Jika rack belum ada dan qty positif, tambahkan
                racks.push({ rack: rackName, stock: qtyToAdjust });
            } else {
                // Tidak mungkin mengurangi stok dari rack yang belum ada
                console.warn(`Cannot reduce stock from non-existent rack: ${rackName}`);
            }

            // Hitung ulang total stok dari semua rack
            const totalStock = racks.reduce((sum, r) => sum + r.stock, 0);

            await updateDoc(itemRef, {
                stock: totalStock,
                racks: racks
            });

        } catch (error) {
            console.error(`Error adjusting stock for item ${itemId}:`, error);
            throw error;
        }
    }

    // ItemsRepository.js
    static async transferItemStock(itemId, fromRackName, toRackName, qty) {
        const itemRef = doc(db, "Items", itemId);
        const itemSnap = await getDoc(itemRef);
        if (!itemSnap.exists()) throw new Error(`Item ${itemId} tidak ditemukan`);

        const data = itemSnap.data();
        const racks = data.racks || [];

        // Update stok di rak asal
        const updatedRacks = [...racks];
        let totalStock = 0;
        let fromFound = false;
        let toFound = false;

        for (let rack of updatedRacks) {
            if (rack.rack === fromRackName) {
                rack.stock = Math.max(0, (rack.stock || 0) - qty);
                fromFound = true;
            }
            if (rack.rack === toRackName) {
                rack.stock = (rack.stock || 0) + qty;
                toFound = true;
            }
        }

        if (!fromFound) {
            updatedRacks.push({ rack: fromRackName, stock: 0 }); // tetap tampilkan rak asal meskipun 0
        }

        if (!toFound) {
            updatedRacks.push({ rack: toRackName, stock: qty });
        }

        // Hitung ulang total stock
        totalStock = updatedRacks.reduce((sum, r) => sum + (r.stock || 0), 0);

        await updateDoc(itemRef, {
            racks: updatedRacks,
            stock: totalStock,
            updatedAt: Timestamp.now(),
        });
    }


    static async deleteItem(itemId) {
        try {
            const docRef = doc(db, "Items", itemId);
            await deleteDoc(docRef);  // Delete the document from Firestore
        } catch (error) {
            console.error("Error deleting items: ", error);
            throw error;
        }
    }

    static async deleteItems(itemId) {
        try {
            if (!Array.isArray(itemId)) {
                itemId = [itemId]; // Ubah jadi array jika bukan array
            }

            const deletePromises = itemId.map(async (id) => {
                const docRef = doc(db, "Items", id);
                await deleteDoc(docRef);
            });

            await Promise.all(deletePromises); // Menjalankan semua penghapusan bersamaan
        } catch (error) {
            console.error("Error deleting items: ", error);
            throw error;
        }
    }
}