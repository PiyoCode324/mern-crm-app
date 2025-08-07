// backend/server.js (修正版)

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

const { verifyFirebaseToken } = require("./middleware/authMiddleware");

// ここにルーターをインポートする
const customersRouter = require("./routes/customers");
const usersRouter = require("./routes/users");
const salesRoutes = require("./routes/salesRoutes");
const contactRoutes = require("./routes/contactRoutes");

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

// Firebase Admin SDKが初期化済みでない場合のみ初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized");
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ strict: false }));

// ルーターにauthMiddlewareを適用
app.use("/api/customers", verifyFirebaseToken, customersRouter);
app.use("/api/users", verifyFirebaseToken, usersRouter);
app.use("/api/sales", verifyFirebaseToken, salesRoutes);
app.use("/api/contacts", verifyFirebaseToken, contactRoutes);

// テスト用公開ルート
app.get("/", (req, res) => {
  res.send("🎉 Backend API is running (CommonJS)");
});

// MongoDB 接続とサーバー起動は変更なし
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectDB();
});
