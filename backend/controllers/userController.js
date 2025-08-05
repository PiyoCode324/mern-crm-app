// backend/controllers/userController.js

const User = require("../models/User");

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
      role: "user", // デフォルトロール（必要に応じて変更）
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
  registerUser,
  getUser,
  updateUser,
  deleteUser,
};
