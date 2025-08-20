const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const itemMargins = {
  "Desi Klos": 0.2,
  "As Pully": 0.2,
  "Botol Klep": 0.2,
  "Brake Shoe": 0.2,
  "Dapur Kopling + Lawan": 0.2,
  "Discpad": 0.2,
  "ECU CDI": 0.2,
  "As Kick Stater": 0.2,
  "Baut Stelan Angin": 0.2,
  "Baut Stelan Klep": 0.2,
  "Bearing Pen Piston": 0.2,
  "Bola Lampu": 0.2,
  "Cage Assy / Cage + Mimis": 0.2,
  "Cam Chain Kit": 0.2,
  "CDI Coil": 0.2,
  "CDI Coil Racing": 0.2,
  "CDI Unit": 0.2,
  "Collar Bosh / Bos Collar": 0.2,
  "Crank Pin": 0.2,
  "Crankcase Right": 0.2,
  "Cylinder Blok Assy": 0.2,
  "Cylinder Blok Only": 0.2,
  "Filter Fuel Pump / Pampers": 0.2,
  "Filter Rotary": 0.2,
  "Flasher Relay": 0.2,
  "Fuel Filter / Saringan Bensin": 0.2,
  "Fuel Pump": 0.2,
  "Gear Belakang": 0.2,
  "Gear Belakang Racing": 0.2,
  "Gear Depan": 0.2,
  "Gear Depan Racing": 0.2,
  "Gear Set": 0.2,
  "Gigi Pinion Starter": 0.2,
  "Gigi Pompa Oli": 0.2,
  "Gigi Starter + Lawan": 0.2,
  "Gigi Timing": 0.2,
  "Handle Grip": 0.2,
  "Ignition Coil": 0.2,
  "Injektor": 0.2,
  "Jari-Jari": 0.2,
  "Jari-Jari 10G": 0.2,
  "Oil Seal Water Pump / Seal Mechanical": 0.2,
  "Paking Bak Kopling / Klos": 0.2,
  "Paking Blok": 0.2,
  "Switch Netral": 0.2,
  "Termostat": 0.2,
  "Van Belt": 0.2,
  "Oil Seal Set": 0.2
};

exports.updateBuyPrices = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("Items").get();

    let batch = db.batch();
    let counter = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const itemName = data.name;
      const merk = data.merk || data.merks?.name || "";
      const salePrice = data.salePrice || 0;

      // Key gabungan name + merk
      const key = `${itemName} ${merk}`.trim();
      const margin = itemMargins[key] ?? 0.2;

      const buyPrice = salePrice * (1 - margin);

      batch.update(doc.ref, { purchasePrice: buyPrice });
      counter++;

      // Commit tiap 500 write
      if (counter % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }

    // Commit sisa batch
    if (counter % 500 !== 0) {
      await batch.commit();
    }

    res.send(`Harga beli berhasil diupdate untuk ${counter} item.`);
  } catch (error) {
    console.error("Error update harga beli:", error);
    res.status(500).send("Terjadi error: " + error.message);
  }
});
