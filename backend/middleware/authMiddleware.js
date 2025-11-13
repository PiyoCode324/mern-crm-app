// backend/middleware/authMiddleware.js

const admin = require("../firebaseAdmin");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

/**
 * 🔹 Firebase トークン検証ミドルウェア
 * @desc リクエストヘッダーから Bearer トークンを取得し、Firebase Admin SDK で検証
 *       検証後、MongoDB からユーザー情報を取得して req.user に付与
 * @access 全ユーザー
 */
const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // トークン未設定チェック
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未認証：トークンがありません" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Firebase トークンの検証
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Firebase decodedToken:", decodedToken); // ✅ デバッグ用

    // MongoDB からユーザー情報取得
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({
        message: "未登録ユーザー：MongoDBにユーザー情報がありません",
      });
    }

    console.log("MongoDB user role:", user.role); // ✅ デバッグ用

    // req.user に Firebase と MongoDB の情報を統合して格納
    req.user = {
      ...decodedToken,
      _id: user._id,
      role: user.role,
    };
    next();
  } catch (err) {
    console.error("Firebase トークン検証エラー:", err.message);
    return res.status(401).json({ message: "未認証：トークンが無効です" });
  }
});

/**
 * 🔹 管理者権限チェックミドルウェア
 * @desc req.user.role を確認し、管理者権限がなければ 403 エラー
 * @access 管理者専用ルート
 */
const isAdmin = (req, res, next) => {
  console.log(
    "isAdmin check on req.user.role:",
    req.user ? req.user.role : "ユーザー情報なし"
  ); // ✅ デバッグ用

  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "管理者権限が必要です。" });
  }
};

module.exports = {
  verifyFirebaseToken,
  isAdmin,
};
