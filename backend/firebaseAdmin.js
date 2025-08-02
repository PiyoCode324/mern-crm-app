// backend/firebaseAdmin.js

import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// 🔽 base64 文字列を JSON にデコード
const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64,
    "base64"
  ).toString("utf-8")
);

// Firebase Admin 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
