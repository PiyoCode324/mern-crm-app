// src/components/NotificationList.jsx
// -----------------------------------------
// 通知ドロップダウンリストコンポーネント
// ・未読/既読の通知を表示
// ・クリックで既読に変更し、親コンポーネントの未読件数を更新
// ・読み込み中・エラー時の表示対応
// -----------------------------------------

import React, { useEffect, useState } from "react";
import {
  getNotifications, // 通知を取得するユーティリティ関数
  markNotificationAsRead, // 通知を既読にするユーティリティ関数
} from "../utils/notification";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext"; // Contextで通知件数を管理

const NotificationList = () => {
  const { user } = useAuth(); // 認証情報取得
  const { refreshNotifications } = useNotifications(); // 親コンポーネント通知件数更新用
  const [notifications, setNotifications] = useState([]); // 通知リスト
  const [loading, setLoading] = useState(true); // 読み込み状態
  const [error, setError] = useState(null); // エラー状態

  /**
   * 通知一覧を取得
   */
  const fetchNotifications = async () => {
    if (!user) return; // 未ログインの場合は処理しない
    setLoading(true); // 読み込み中表示
    try {
      const data = await getNotifications(); // API/ユーティリティから取得
      setNotifications(data); // stateに反映
      setError(null); // エラーリセット
    } catch (err) {
      setError("通知の取得に失敗しました。");
      console.error("❌ 通知の取得に失敗しました:", err.message);
    } finally {
      setLoading(false); // 読み込み完了
    }
  };

  /**
   * 初回レンダリングまたは依存関係変更時に通知取得
   */
  useEffect(() => {
    fetchNotifications();
  }, [user, refreshNotifications]); // ContextのrefreshNotificationsを依存関係に追加

  /**
   * 通知クリック時の処理
   * ・既読にする
   * ・UIを更新
   * ・親コンポーネントの未読件数も更新
   */
  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId); // 既読処理
      await fetchNotifications(); // 通知リスト再取得
      refreshNotifications(); // Contextの未読件数更新
    } catch (err) {
      console.error("❌ 通知を既読にする処理に失敗しました:", err.message);
    }
  };

  // 読み込み中表示
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">通知を読み込み中...</div>
    );
  }

  // エラー表示
  if (error) {
    return <div className="p-4 text-center text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="notification-list max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        // 通知がない場合の表示
        <p className="p-4 text-center text-gray-500">
          未読の通知はありません。
        </p>
      ) : (
        // 通知リスト表示
        notifications.map((n) => (
          <div
            key={n._id}
            className={`notification-item p-3 mb-2 rounded border cursor-pointer ${
              n.isRead ? "bg-gray-100 font-normal" : "bg-blue-200 font-bold"
            } hover:bg-blue-300 transition`}
            onClick={() => handleNotificationClick(n._id)} // クリックで既読処理
          >
            <p className="text-sm">{n.message}</p>
            <span className="text-xs text-gray-500 block mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
