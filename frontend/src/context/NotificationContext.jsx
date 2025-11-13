// src/context/NotificationContext.jsx
// 未読通知の件数をグローバルに管理するコンテキスト
// useAuth() で取得したログインユーザー情報をもとに、
// 通知件数を取得・更新できるようにする

import React, { createContext, useState, useContext, useEffect } from "react";
import { getNotifications } from "../utils/notification"; // 未読通知取得関数
import { useAuth } from "./AuthContext"; // 認証情報を取得するカスタムフック

// NotificationContextを作成
const NotificationContext = createContext();

// NotificationProviderコンポーネント
// children配下で useNotifications() を使って通知情報を取得可能
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // 現在ログインしているユーザー
  const [unreadCount, setUnreadCount] = useState(0); // 未読通知件数の状態

  /**
   * 未読通知の件数を取得し、状態を更新する
   * ログインしていない場合は件数を0にする
   */
  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const notifications = await getNotifications(); // APIやローカルで通知取得
      setUnreadCount(notifications.length);
    } catch (err) {
      console.error("❌ 未読通知数の取得に失敗しました:", err.message);
      setUnreadCount(0);
    }
  };

  /**
   * リアルタイム更新のトリガーとして使用する関数
   * 他のコンポーネントから呼び出して通知件数を再取得可能
   */
  const refreshNotifications = () => {
    fetchUnreadCount();
  };

  // ユーザー情報が変更されたときに未読件数を取得
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// カスタムフックで簡単にContext利用
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
