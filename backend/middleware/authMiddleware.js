// backend/middleware/authMiddleware.js

const admin = require("../firebaseAdmin");
const User = require("../models/User"); // Userモデルをインポート
const asyncHandler = require("express-async-handler"); // ✅ asyncHandlerをインポート

const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
  // ✅ asyncHandlerでラップ
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未認証：トークンがありません" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Firebase UIDを使用してMongoDBからユーザーを取得
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res
        .status(404)
        .json({ message: "未登録ユーザー：MongoDBにユーザー情報がありません" });
    }

    // ✅ req.user に Firebaseのデコード済みトークンとMongoDBのユーザー情報を両方格納
    req.user = {
      ...decodedToken, // FirebaseのUID, emailなど
      _id: user._id, // MongoDBのユーザーID
      role: user.role, // MongoDBのユーザーロール
    };
    next();
  } catch (err) {
    console.error("Firebase トークン検証エラー:", err.message);
    // Firebaseトークンが無効な場合や期限切れの場合
    return res.status(401).json({ message: "未認証：トークンが無効です" });
  }
});

// ✅ 新しいミドルウェア：管理者権限のチェック
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "管理者権限が必要です。" });
  }
};

// ✅ isAdminをエクスポートに追加
module.exports = {
  verifyFirebaseToken,
  isAdmin,
};
