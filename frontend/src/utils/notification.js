// src/utils/notification.js

import { authorizedRequest } from "../services/authService";

/**
 * @desc ユーザーの通知一覧を取得する関数
 *
 * 処理の流れ:
 * 1. authorizedRequest を使って認証付きGETリクエストで /notifications へアクセス
 * 2. 成功した場合、通知リストを返却
 * 3. 失敗した場合、エラーをコンソール出力してthrow
 *
 * @returns {Promise<Array>} 通知の配列
 */
export const getNotifications = async () => {
  try {
    const response = await authorizedRequest("get", "/notifications");
    console.log("✅ 通知リスト取得成功:", response);
    return response;
  } catch (error) {
    console.error("❌ 通知の取得に失敗しました:", error.message);
    throw error;
  }
};

/**
 * @desc 特定の通知を既読としてマークする関数
 *
 * 処理の流れ:
 * 1. authorizedRequest を使って PATCH リクエストで /notifications/:id/read へアクセス
 * 2. 成功した場合、既読処理成功のレスポンスを返却
 * 3. 失敗した場合、エラーをコンソール出力してthrow
 *
 * @param {string} id - 対象通知のID
 * @returns {Promise<Object>} 成功レスポンス
 */
export const markNotificationAsRead = async (id) => {
  try {
    const response = await authorizedRequest(
      "patch",
      `/notifications/${id}/read`
    );
    console.log(`✅ 通知ID ${id} を既読にしました`);
    return response;
  } catch (error) {
    console.error(`❌ 通知ID ${id} の既読処理に失敗しました:`, error.message);
    throw error;
  }
};
