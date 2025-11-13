// src/services/notificationService.js

import { authorizedRequest } from "./authService";

/**
 * 通知一覧を取得する関数
 * - 認証済みユーザーの通知をサーバーから取得
 * - 通知が存在しない場合は空配列を返す
 */
export async function fetchNotifications() {
  const response = await authorizedRequest("get", "/notifications");
  // サーバーから返却されたnotifications配列を返す。存在しなければ空配列
  return response.notifications || [];
}

/**
 * 通知を追加する関数
 * @param {string} message - 通知メッセージ
 * @param {string} recipientUid - 通知の受信者UID
 * @param {string|null} taskId - 関連タスクID（任意）
 *
 * - サーバーにPOSTリクエストを送り、通知を作成
 */
export async function addNotification(message, recipientUid, taskId = null) {
  await authorizedRequest("post", "/notifications", {
    recipientUid,
    message,
    taskId,
  });
}

/**
 * 通知を既読にする関数
 * @param {string} id - 既読にする通知のID
 *
 * - PATCHリクエストを送り、通知ステータスを更新
 */
export async function markNotificationAsRead(id) {
  await authorizedRequest("patch", `/notifications/${id}/read`);
}
