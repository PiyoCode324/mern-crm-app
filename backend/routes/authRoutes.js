// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const admin = require('../firebaseAdmin'); // Firebase Admin SDKをインポート

// ✅ パスワードリセットメール送信リクエストのエンドポイント
router.post(
  '/request-password-reset',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // メールアドレスが提供されているか確認
    if (!email) {
      return res.status(400).json({ message: 'メールアドレスを入力してください' });
    }

    try {
      // Firebaseにパスワードリセットメールの送信を依頼
      await admin.auth().sendPasswordResetEmail(email);
      res.status(200).json({ message: 'パスワードリセットのメールを送信しました' });
    } catch (error) {
      console.error('パスワードリセットメールの送信エラー:', error);
      // Firebaseからのエラーメッセージを返す
      let errorMessage = 'パスワードリセットに失敗しました。';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'そのメールアドレスのユーザーは見つかりませんでした。';
      }
      res.status(400).json({ message: errorMessage });
    }
  })
);

module.exports = router;
