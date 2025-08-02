// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const { verifyFirebaseToken } = require("./middleware/authMiddleware");
const customersRouter = require("./routes/customers");
const usersRouter = require("./routes/users");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/customers", customersRouter);
app.use("/api/users", usersRouter);

// MongoDB 接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// 認証が必要なAPIルート
app.get("/api/customers", verifyFirebaseToken, (req, res) => {
  res.json({ message: "🛡️ 認証されたユーザーのみが見られる顧客データです" });
});

// テスト用公開ルート
app.get("/", (req, res) => {
  res.send("🎉 Backend API is running (CommonJS)");
});

// サーバー起動
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectDB();
});
