// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const admin = require("../firebaseAdmin"); // Firebase Admin SDKをインポート
const User = require("../models/User"); // MongoDBのユーザーモデルをインポート

// ======================================================================
// 🔐 認証関連のルーティング
// このファイルでは、Firebase 認証を利用した「パスワードリセット」や
// 「トークンリフレッシュ」に関するエンドポイントを提供する。
// ======================================================================

// ✅ パスワードリセットメール送信リクエストのエンドポイント
router.post(
  "/request-password-reset",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // 📌 クライアントからメールアドレスが送信されているか確認
    if (!email) {
      return res
        .status(400)
        .json({ message: "メールアドレスを入力してください" });
    }

    try {
      // 📌 Firebase Authentication に対して
      //    パスワードリセットメールの送信を依頼
      await admin.auth().sendPasswordResetEmail(email);

      // 📌 成功レスポンスを返す
      res
        .status(200)
        .json({ message: "パスワードリセットのメールを送信しました" });
    } catch (error) {
      console.error("パスワードリセットメールの送信エラー:", error);

      // 📌 Firebaseからのエラーコードに応じてメッセージを調整
      let errorMessage = "パスワードリセットに失敗しました。";
      if (error.code === "auth/user-not-found") {
        errorMessage = "そのメールアドレスのユーザーは見つかりませんでした。";
      }

      // 📌 エラーレスポンスを返す
      res.status(400).json({ message: errorMessage });
    }
  })
);

// ✅ 新規: トークンをリフレッシュするエンドポイント
router.post(
  "/refresh-token",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    // 📌 リクエストにリフレッシュトークンが含まれているか確認
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "リフレッシュトークンがありません" });
    }

    try {
      // 📌 Firebaseでトークンを検証してUIDを取得
      const decodedToken = await admin.auth().verifyIdToken(refreshToken);
      const uid = decodedToken.uid;

      // 📌 新しいカスタムトークン（=IDトークンとして利用可能）を生成
      const newIdToken = await admin.auth().createCustomToken(uid);

      // 📌 新しいトークンを返す
      res.status(200).json({
        idToken: newIdToken,
        message: "新しいトークンを発行しました。",
      });
    } catch (error) {
      console.error("リフレッシュトークンの検証エラー:", error);

      // 📌 不正なリフレッシュトークンの場合は401を返す
      return res
        .status(401)
        .json({ message: "無効なリフレッシュトークンです" });
    }
  })
);

module.exports = router;
