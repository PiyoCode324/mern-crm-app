// backend/routes/taskRoutes.js

const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// 💡 リクエストボディの内容をログに出力するミドルウェア
// 主にPOSTやPUTなどのリクエストで送られてくるデータを確認するために使用
const logRequestBody = (req, res, next) => {
  console.log("📝 ルートに到達したリクエストボディ:", req.body);
  next();
};

// ============================
// タスク関連ルート
// ============================

// 📄 全タスクを取得（認証必須）
// 例: GET /api/tasks
router.get("/", verifyFirebaseToken, taskController.getAllTasks);

// 📄 特定の顧客に紐づくタスクを取得（認証必須）
// 例: GET /api/tasks/customer/:id
router.get(
  "/customer/:id",
  verifyFirebaseToken,
  taskController.getTasksByCustomer
);

// ✏️ タスク作成（認証必須）
// logRequestBodyで送信データを確認できる
// 例: POST /api/tasks
router.post(
  "/",
  verifyFirebaseToken,
  logRequestBody,
  taskController.createTask
);

// ✏️ タスク更新（認証必須）
// logRequestBodyで送信データを確認できる
// 例: PUT /api/tasks/:id
router.put(
  "/:id",
  verifyFirebaseToken,
  logRequestBody,
  taskController.updateTask
);

// 🗑️ タスク削除（認証必須）
// 例: DELETE /api/tasks/:id
router.delete("/:id", verifyFirebaseToken, taskController.deleteTask);

module.exports = router;
