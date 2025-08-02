// firebaseAdmin.js

import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin 初期化
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON)
  ),
});

export default admin;
