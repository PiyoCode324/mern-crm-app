// backend/server.js (修正版)

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const { verifyFirebaseToken } = require("./middleware/authMiddleware");

// ✅ ここにルーターをインポートする
const customersRouter = require("./routes/customers");
const usersRouter = require("./routes/users");
const salesRoutes = require("./routes/salesRoutes");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

const app = express();

// Middlewareをルーターの前に配置することが重要です
app.use(cors());
app.use(express.json({ strict: false })); // ✅ express.json()の位置に注意

// ルーターにauthMiddlewareを適用
app.use("/api/customers", verifyFirebaseToken, customersRouter); // ✅ ここを修正
app.use("/api/users", verifyFirebaseToken, usersRouter); // ✅ 他の認証が必要なルートも同様に修正
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectDB();
});
