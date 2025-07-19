const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.syncsAdjustment = onDocumentWritten(
  {
    region: "asia-southeast2",
  },
  "Adjustment/{adjId}",
  async (event) => {
    const beforeSnap = event.data.before;
    const afterSnap = event.data.after;

    const parseItems = (snap) => {
      if (!snap) return [];
      const data = snap.data();
      if (!Array.isArray(data.items)) return [];
      return data.items.map((item) => ({
        itemId: item.item.id,
        qty: item.qty,
      }));
    };

    const beforeItems = parseItems(beforeSnap);
    const afterItems = parseItems(afterSnap);

    // Buat Map untuk qty
    const beforeMap = new Map(beforeItems.map((i) => [i.itemId, i.qty]));
    const afterMap = new Map(afterItems.map((i) => [i.itemId, i.qty]));

    const allItemIds = new Set([...beforeMap.keys(), ...afterMap.keys()]);

    const batch = db.batch();

    for (const itemId of allItemIds) {
      const beforeQty = beforeMap.get(itemId) || 0;
      const afterQty = afterMap.get(itemId) || 0;
      const delta = afterQty - beforeQty;

      if (delta !== 0) {
        const itemRef = db.collection("Items").doc(itemId);
        batch.update(itemRef, {
          qty: FieldValue.increment(delta),
        });
      }
    }

    return batch.commit();
  }
);
