const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json"); // Pastikan path benar

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;