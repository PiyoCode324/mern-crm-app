// backend/updateAdmin.js

const admin = require("firebase-admin");
const dotenv = require("dotenv");

// .envファイルを読み込む
dotenv.config();

// 環境変数からBase64キーを読み込み、デコードする
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!serviceAccountBase64) {
  console.error(
    "環境変数 FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 が設定されていません。"
  );
  process.exit(1);
}
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
);

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized");
}

// ユーザーのUIDをここに貼り付け
const targetUid = "62WqtUsUCdhjSF56eQQ7zVfWbem2"; // ✅ このUIDを、コンソールログに表示されたものに置き換えてください

async function setAdminClaim() {
  try {
    await admin.auth().setCustomUserClaims(targetUid, { role: "admin" });
    console.log(
      `✅ ユーザー ${targetUid} のカスタムクレームを 'admin' に設定しました。`
    );
  } catch (error) {
    console.error("❌ カスタムクレームの更新に失敗しました:", error);
  }
}

setAdminClaim();
