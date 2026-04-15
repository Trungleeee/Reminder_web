const admin = require("firebase-admin");

// Tải file serviceAccountKey.json từ Firebase Console
// Project Settings → Service Accounts → Generate new private key
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;