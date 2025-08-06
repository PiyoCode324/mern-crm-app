// backend/controllers/userController.js (修正版)

const User = require("../models/User");

// ✅ 修正: 複数のユーザー情報を取得する関数を追加
const getUsers = async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(",") : [];
    if (ids.length === 0) {
      return res.json([]);
    }

    const users = await User.find({ uid: { $in: ids } });
    const formattedUsers = users.map((user) => ({
      uid: user.uid,
      // ✅ 修正: user.nameからuser.displayNameに変更
      displayName: user.displayName,
      email: user.email,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("❌ ユーザー情報取得エラー:", err);
    res.status(500).json({ error: "ユーザー情報の取得に失敗しました" });
  }
};

// 🔹 ユーザー新規登録（Firebase認証済みのユーザーをMongoDBに登録）
const registerUser = async (req, res) => {
  try {
    const { uid, name, email } = req.user;

    // すでに登録されているか確認
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "既に登録済み", user: existingUser });
    }

    // 新規ユーザーを作成
    const newUser = new User({
      uid,
      name,
      email,
      role: "user",
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "登録完了", user: savedUser });
  } catch (err) {
    console.error("❌ ユーザー登録エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

// 🔸 ユーザー情報の取得（自身）
const getUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await User.findOne({ uid });

    if (!user)
      return res.status(404).json({ message: "ユーザーが見つかりません" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("❌ ユーザー取得エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

// 🔸 ユーザー情報の更新（自身）
const updateUser = async (req, res) => {
  try {
    const { uid } = req.user;
    const updates = req.body;

    const updatedUser = await User.findOneAndUpdate({ uid }, updates, {
      new: true,
    });

    if (!updatedUser)
      return res.status(404).json({ message: "ユーザーが見つかりません" });

    res.status(200).json({ message: "更新完了", user: updatedUser });
  } catch (err) {
    console.error("❌ ユーザー更新エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

// 🔸 ユーザー削除（自身）
const deleteUser = async (req, res) => {
  try {
    const { uid } = req.user;

    const deletedUser = await User.findOneAndDelete({ uid });
    if (!deletedUser)
      return res.status(404).json({ message: "ユーザーが見つかりません" });

    res.status(200).json({ message: "ユーザー削除完了" });
  } catch (err) {
    console.error("❌ ユーザー削除エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
};

module.exports = {
  getUsers, // ✅ 修正: 新しい関数をエクスポート
  registerUser,
  getUser,
  updateUser,
  deleteUser,
};
