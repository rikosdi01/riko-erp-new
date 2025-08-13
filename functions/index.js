const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

/**
 * Ganti password user lain
 * Dipanggil dari frontend pakai httpsCallable
 */
exports.changeUserPassword = functions.https.onCall(async (data, context) => {
  const { uid, newPassword } = data;

  // Cek apakah pemanggil punya role admin
  if (!context.auth || context.auth.token.role !== "administrator") {
    throw new functions.https.HttpsError("permission-denied", "Tidak punya akses.");
  }

  await admin.auth().updateUser(uid, { password: newPassword });
  return { message: "Password berhasil diganti." };
});

/**
 * Nonaktifkan / aktifkan akun user lain
 */
exports.setUserStatus = functions.https.onCall(async (data, context) => {
  const { uid, disabled } = data;

  if (!context.auth || context.auth.token.role !== "administrator") {
    throw new functions.https.HttpsError("permission-denied", "Tidak punya akses.");
  }

  await admin.auth().updateUser(uid, { disabled });

  // Opsional: update Firestore juga supaya status konsisten di UI
  const userRef = db.collection("users").doc(uid);
  await userRef.update({ status: disabled ? "inactive" : "active" });

  return { message: `User ${disabled ? "dinonaktifkan" : "diaktifkan"} berhasil.` };
});

/**
 * Hapus akun user lain
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  const { uid } = data;

  if (!context.auth || context.auth.token.role !== "administrator") {
    throw new functions.https.HttpsError("permission-denied", "Tidak punya akses.");
  }

  await admin.auth().deleteUser(uid);

  // Opsional: hapus data Firestore juga
  await db.collection("users").doc(uid).delete();

  return { message: "User berhasil dihapus." };
});
