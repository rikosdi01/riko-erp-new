const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "TeNrO41qW2cE4gl1ZLOAZ6ZWheH2"; // UID admin

admin.auth().setCustomUserClaims(uid, { role: "administrator" })
  .then(() => {
    console.log("✅ Admin role set untuk UID:", uid);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
