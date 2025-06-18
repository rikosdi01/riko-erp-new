const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.syncsAdjustment = onDocumentWritten(
    {
        region: "asia-southeast2", // tambahkan region
    },
    "Adjustment/{adjId}",
    async (event) => {
        if (!event.data) {
            console.log("No event.data");
            return;
        }

        const beforeSnap = event.data.before?.value;
        const afterSnap = event.data.after?.value;

        const beforeData = beforeSnap ? beforeSnap.fields : null;
        const afterData = afterSnap ? afterSnap.fields : null;

        // Optional: parse Firestore field values
        const parseItems = (data) => {
            if (!data || !data.items || !data.items.arrayValue?.values) return [];
            return data.items.arrayValue.values.map((v) => ({
                item: { id: v.mapValue.fields.item.mapValue.fields.id.stringValue },
                qty: parseInt(v.mapValue.fields.qty.integerValue || "0")
            }));
        };

        const batch = db.batch();

        const updateQty = async (itemId, delta) => {
            const itemRef = db.collection("Items").doc(itemId);
            const itemSnap = await itemRef.get();
            const currentQty = itemSnap.exists ? itemSnap.data().qty || 0 : 0;
            batch.update(itemRef, { qty: currentQty + delta });
        };

        if (beforeData && !afterData) {
            if (!Array.isArray(beforeData.items)) return;
            for (const i of beforeData.items) {
                await updateQty(i.item.id, -parseInt(i.qty));
            }
        } else if (!beforeData && afterData) {
            if (!Array.isArray(afterData.items)) return;
            for (const i of parseItems(afterData)) {
                await updateQty(i.item.id, parseInt(i.qty));
            }
        } else if (beforeData && afterData) {
            const beforeMap = new Map(beforeData.items.map((i) => [i.item.id, parseInt(i.qty)]));
            const afterMap = new Map(afterData.items.map((i) => [i.item.id, parseInt(i.qty)]));
            const allItemIds = new Set([...beforeMap.keys(), ...afterMap.keys()]);

            for (const id of allItemIds) {
                const beforeQty = beforeMap.get(id) || 0;
                const afterQty = afterMap.get(id) || 0;
                const delta = afterQty - beforeQty;
                if (delta !== 0) {
                    await updateQty(id, delta);
                }
            }
        }

        return batch.commit();
    });
