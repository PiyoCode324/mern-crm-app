// backend/firebaseAdmin.js

// Firebase Admin SDK をインポート
const admin = require("firebase-admin");
require("dotenv").config(); // 環境変数を読み込む

// 🔹 Firebaseサービスアカウントの認証情報を取得
// 環境変数に base64 エンコードされた JSON 文字列として保存されている
const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, // 環境変数
    "base64" // Base64 文字列をデコード
  ).toString("utf-8") // UTF-8 文字列に変換
);

// 🔹 Firebase Admin SDK の初期化
// 多重初期化を防ぐため、すでに初期化されていない場合のみ初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // サービスアカウント認証情報を使用
  });
}

// 🔹 他ファイルから admin を使えるようにエクスポート
module.exports = admin;
