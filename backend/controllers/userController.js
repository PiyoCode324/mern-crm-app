// backend/controllers/userController.js

const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const admin = require("../firebaseAdmin");

/**
 * 🔹 ユーザー新規登録（Firebase認証済みのユーザーをMongoDBに登録）
 * @desc Firebase UID, email, displayName を受け取り、MongoDB にユーザーを登録
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  console.log("📥 [registerUser] 新規登録リクエスト受信:", req.body);

  const { uid, email, displayName } = req.body;

  // 必須情報チェック
  if (!uid || !email) {
    return res.status(400).json({ message: "必須情報が不足しています。" });
  }

  console.log("🔑 Firebase UID:", uid);
  console.log("📧 Email:", email);
  console.log("📝 Display Name:", displayName);

  // 既存ユーザー確認
  const existingUser = await User.findOne({ uid: uid });
  if (existingUser) {
    console.log("⚠️ 既に登録済みのユーザー:", existingUser.email);
    return res
      .status(200)
      .json({ message: "既に登録済み", user: existingUser });
  }

  // 新規ユーザー作成
  const newUser = new User({
    uid,
    displayName,
    email,
    role: "user", // デフォルトは一般ユーザー
  });

  const savedUser = await newUser.save();
  console.log("✅ 新規ユーザー登録完了:", savedUser._id);

  res.status(201).json({ message: "登録完了", user: savedUser });
});

/**
 * 🔸 自身のユーザー情報取得
 * @desc 認証ユーザーが自身の情報を取得
 * @route GET /api/users/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const user = await User.findOne({ uid: uid });

  if (!user) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ user });
});

/**
 * 🔸 自身のユーザー情報更新
 * @desc 認証ユーザーが自身の情報を更新
 * @route PATCH /api/users/me
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const updates = req.body;

  const updatedUser = await User.findOneAndUpdate({ uid: uid }, updates, {
    new: true,
  });

  if (!updatedUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ message: "更新完了", user: updatedUser });
});

/**
 * 🔸 自身のユーザー削除
 * @desc 認証ユーザーが自身のアカウントを削除
 * @route DELETE /api/users/me
 * @access Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const deletedUser = await User.findOneAndDelete({ uid: uid });

  if (!deletedUser) {
    return res.status(404).json({ message: "ユーザーが見つかりません" });
  }

  res.status(200).json({ message: "ユーザー削除完了" });
});

/**
 * ✅ 複数ユーザー情報取得
 * @desc 複数のユーザーをUIDで取得
 * @route GET /api/users?ids=uid1,uid2
 * @access Private
 */
const getUsers = asyncHandler(async (req, res) => {
  const ids = req.query.ids ? req.query.ids.split(",") : [];
  if (ids.length === 0) {
    return res.json([]);
  }

  const users = await User.find({ uid: { $in: ids } });

  const formattedUsers = users.map((user) => ({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  }));

  res.json(formattedUsers);
});

/**
 * ✅ 管理者専用：すべてのユーザーを取得（検索機能あり）
 * @desc Firebase情報も取得して結合
 * @route GET /api/users/all
 * @access Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { email: { $regex: search, $options: "i" } },
      { displayName: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).select("-password");
  if (!users) {
    return res.status(404).json({ message: "ユーザーが見つかりません。" });
  }

  const usersWithFirebaseInfo = await Promise.all(
    users.map(async (user) => {
      try {
        const firebaseUser = await admin.auth().getUser(user.uid);
        return {
          ...user.toObject(),
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          disabled: firebaseUser.disabled,
        };
      } catch (error) {
        console.error(`Firebaseユーザー取得エラー (UID: ${user.uid}):`, error);
        return { ...user.toObject(), disabled: true, firebaseError: true };
      }
    })
  );

  res.status(200).json({ users: usersWithFirebaseInfo });
});

/**
 * 🔹 認証ユーザー向け：基本情報のみ取得
 * @desc 安全に最小限の情報を返す
 * @route GET /api/users/basic
 * @access Private
 */
const getUsersBasic = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("uid displayName role");
  if (users) {
    res.status(200).json({ users });
  } else {
    res.status(404).json({ message: "ユーザーが見つかりません。" });
  }
});

/**
 * ✅ ユーザーの役割更新
 * @desc 指定ユーザーの role を更新
 * @route PATCH /api/users/:id/role
 * @access Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findOne({ uid: id });
  if (!user) {
    res.status(404);
    throw new Error("ユーザーが見つかりません。");
  }

  user.role = role;
  await user.save();

  res.status(200).json({ message: "ユーザーの役割が更新されました。", user });
});

/**
 * ✅ ユーザーの有効化/無効化切替
 * @desc Firebase UID で指定されたユーザーの disabled ステータスを更新
 * @route PATCH /api/users/:id/disable
 * @access Admin
 */
const toggleUserDisabledStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { disabled } = req.body;

  if (!id || typeof disabled !== "boolean") {
    return res.status(400).json({
      message:
        "ユーザーID(Firebase UID)と無効化ステータス(disabled: boolean)が必要です。",
    });
  }

  try {
    await admin.auth().updateUser(id, { disabled: disabled });

    res.status(200).json({
      message: `ユーザーアカウントは正常に${
        disabled ? "無効化" : "有効化"
      }されました。`,
    });
  } catch (error) {
    console.error("ユーザーの有効化/無効化に失敗しました:", error);
    return res
      .status(500)
      .json({ message: "ユーザーの有効化/無効化に失敗しました。" });
  }
});

/**
 * ✅ 特定ユーザー情報取得
 * @desc UID で指定されたユーザーの情報を取得（MongoDB + Firebase 結合）
 * @route GET /api/users/:id
 * @access Admin / Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Firebase UID
  const user = await User.findOne({ uid: id }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("ユーザーが見つかりません。");
  }

  try {
    const firebaseUser = await admin.auth().getUser(id);
    const userWithFirebaseInfo = {
      ...user.toObject(),
      uid: firebaseUser.uid,
      disabled: firebaseUser.disabled,
    };

    res.status(200).json({ user: userWithFirebaseInfo });
  } catch (error) {
    console.error("Firebaseユーザー情報の取得に失敗しました:", error);
    res.status(500);
    throw new Error("ユーザー情報の取得に失敗しました。");
  }
});

module.exports = {
  registerUser,
  getMe,
  updateUser,
  deleteUser,
  getUsers,
  getAllUsers,
  getUsersBasic,
  updateUserRole,
  toggleUserDisabledStatus,
  getUserById, // ✅ ここを追加
};
