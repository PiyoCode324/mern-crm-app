// backend/controllers/userController.js

const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// 🔹 ユーザー新規登録（Firebase認証済みのユーザーをMongoDBに登録）
const registerUser = asyncHandler(async (req, res) => {
  console.log("📥 [registerUser] 新規登録リクエスト受信:", req.body);

  // 💡 修正: req.body から直接 firebaseUid, email, displayName を取得
  const { firebaseUid, email, displayName } = req.body;

  if (!firebaseUid || !email) {
    return res.status(400).json({ message: "必須情報が不足しています。" });
  }

  console.log("🔑 Firebase UID:", firebaseUid);
  console.log("📧 Email:", email);
  console.log("📝 Display Name:", displayName);

  const existingUser = await User.findOne({ uid: firebaseUid }); // 💡 修正: uid で検索
  if (existingUser) {
    console.log("⚠️ 既に登録済みのユーザー:", existingUser.email);
    return res
      .status(200)
      .json({ message: "既に登録済み", user: existingUser });
  }

  const newUser = new User({
    uid: firebaseUid, // 💡 修正: ここで firebaseUid を uid フィールドにマッピング
    displayName,
    email,
    role: "user",
  });

  const savedUser = await newUser.save();
  console.log("✅ 新規ユーザー登録完了:", savedUser._id);

  res.status(201).json({ message: "登録完了", user: savedUser });
});

// 🔸 ユーザー情報の取得（自身）
const getUser = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ user });
});

// 🔸 ユーザー情報の更新（自身）
const updateUser = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const updates = req.body;
  const updatedUser = await User.findOneAndUpdate(
    { firebaseUid: uid },
    updates,
    {
      new: true,
    }
  );

  if (!updatedUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ message: "更新完了", user: updatedUser });
});

// 🔸 ユーザー削除（自身）
const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const deletedUser = await User.findOneAndDelete({ firebaseUid: uid });

  if (!deletedUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ message: "ユーザー削除完了" });
});

// ✅ 複数の特定のユーザー情報を取得する関数
const getUsers = asyncHandler(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",") : [];
  if (ids.length === 0) {
    return res.json([]);
  }
  const users = await User.find({ firebaseUid: { $in: ids } });

  const formattedUsers = users.map((user) => ({
    uid: user.firebaseUid,
    displayName: user.displayName,
    email: user.email,
  }));

  res.json(formattedUsers);
});

// ✅ 管理者専用：すべてのユーザーを取得するコントローラー
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  if (users) {
    res.status(200).json({ users });
  } else {
    res.status(404).json({ message: "ユーザーが見つかりません。" });
  }
});

// ✅ 新しい関数：ユーザーの役割を更新
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("ユーザーが見つかりません。");
  }

  user.role = role;
  await user.save();

  res.status(200).json({ message: "ユーザーの役割が更新されました。", user });
});

module.exports = {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  getAllUsers,
  updateUserRole,
};
