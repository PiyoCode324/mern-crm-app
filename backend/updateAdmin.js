// backend/updateAdmin.js

// Firebase Admin SDKをインポート
const admin = require("firebase-admin");
// 環境変数読み込み用
const dotenv = require("dotenv");
// MongoDB接続用Mongoose
const mongoose = require("mongoose");
// ユーザーモデルをインポート（MongoDB上のユーザー情報操作用）
const User = require("./models/User");

// .envファイルの読み込み
dotenv.config();

// ============================
// MongoDB接続
// ============================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ============================
// Firebase Admin SDK初期化
// ============================
// 環境変数からBase64でエンコードされたサービスアカウントキーを取得
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!serviceAccountBase64) {
  console.error(
    "環境変数 FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 が設定されていません。"
  );
  process.exit(1);
}

// Base64をデコードしてJSONに変換
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
);

// Firebase Admin SDKを初期化（多重初期化を防ぐ）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized");
}

// ============================
// 管理者にしたいユーザーのUIDを設定
// ============================
const targetUid = "WzwMXMJFA0NuMsPjKOmkzzPgeFx2";

// ============================
// 関数: FirebaseとMongoDB両方でユーザーをadminに設定
// ============================
async function setAdminClaimAndRole() {
  try {
    // Firebaseにカスタムクレームとしてrole: "admin"を設定
    await admin.auth().setCustomUserClaims(targetUid, { role: "admin" });
    console.log(
      `✅ ユーザー ${targetUid} のカスタムクレームを 'admin' に設定しました。`
    );

    // MongoDB側のユーザー役割も更新
    const user = await User.findOne({ uid: targetUid });
    if (user) {
      user.role = "admin";
      await user.save();
      console.log(
        `✅ ユーザー ${targetUid} のMongoDBの役割を 'admin' に更新しました。`
      );
    } else {
      console.error("❌ MongoDBにユーザーが見つかりませんでした。");
    }
  } catch (error) {
    console.error("❌ 役割の更新に失敗しました:", error);
  } finally {
    // 処理終了後にMongoDB接続を閉じる
    mongoose.connection.close();
  }
}

// 関数を呼び出して処理実行
setAdminClaimAndRole();
