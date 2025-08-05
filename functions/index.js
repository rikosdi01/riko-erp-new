const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.addIsActiveFieldToItems = functions.https.onRequest(async (req, res) => {
  try {
    const itemsRef = db.collection("Items");
    const snapshot = await itemsRef.get();

    if (snapshot.empty) {
      res.status(200).send("Tidak ada dokumen di koleksi Items.");
      return;
    }

    const BATCH_LIMIT = 500; // batas batch Firestore
    let batch = db.batch();
    let batchCounter = 0;

    snapshot.docs.forEach((doc, idx) => {
      const docRef = itemsRef.doc(doc.id);
      batch.update(docRef, { isActive: true });
      batchCounter++;

      // commit setiap 500 update untuk hindari limit Firestore
      if (batchCounter === BATCH_LIMIT) {
        batch.commit();
        batch = db.batch();
        batchCounter = 0;
      }
    });

    if (batchCounter > 0) {
      await batch.commit();
    }

    res.status(200).send("Field 'isActive: true' berhasil ditambahkan ke semua dokumen di Items.");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).send("Gagal menambahkan field: " + error.message);
  }
});
