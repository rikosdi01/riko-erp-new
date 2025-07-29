const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.removeSetField = functions.https.onRequest(async (req, res) => {
  try {
    const batchSize = 300;
    let lastDoc = null;
    let totalUpdated = 0;

    while (true) {
      let query = db.collection("Items")
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(batchSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        break;
      }

      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        const ref = doc.ref;
        if (doc.get("set") !== undefined) {
          batch.update(ref, { set: admin.firestore.FieldValue.delete() });
        }
      });

      await batch.commit();
      totalUpdated += snapshot.docs.length;
      console.log(`${totalUpdated} documents updated...`);

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    console.log("✅ Selesai menghapus field 'set' dari semua dokumen.");
    res.status(200).send("Field 'set' berhasil dihapus dari semua dokumen.");
  } catch (err) {
    console.error("❌ Terjadi kesalahan:", err);
    res.status(500).send("Terjadi kesalahan: " + err.message);
  }
});
