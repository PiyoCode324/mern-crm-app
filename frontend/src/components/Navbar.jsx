// components/Navbar.jsx
// -----------------------------------------
// ナビゲーションバーコンポーネント
// ・ログイン状態に応じてリンクを表示
// ・管理者ユーザーにはユーザー管理リンクを表示
// ・通知ベルアイコンと未読件数表示
// ・ドロップダウンクリック外で閉じる
// ・ログアウト機能
// -----------------------------------------

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext"; // 通知Contextから情報取得
import NotificationList from "./NotificationList"; // 通知リストコンポーネント
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth(); // 認証情報取得
  const { unreadCount, refreshNotifications } = useNotifications(); // 未読通知件数と更新関数取得
  const navigate = useNavigate();

  // 通知ドロップダウンの開閉状態
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);

  // ドロップダウンDOM参照
  const dropdownRef = useRef(null);

  /**
   * ドロップダウンの外をクリックした場合に閉じる処理
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // クリーンアップ
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  /**
   * 通知ベルアイコンクリック時の処理
   * ドロップダウンの開閉切替と通知のリフレッシュ
   */
  const handleBellClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);

    // 開いたときのみ通知をリフレッシュ
    if (!isNotificationDropdownOpen) {
      refreshNotifications();
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    try {
      await logout(); // 認証Contextのlogout関数
      navigate("/login"); // ログインページへリダイレクト
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      {/* 左側: ナビリンク */}
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold mr-6">
          CRM App
        </Link>
        {user && (
          <>
            {/* ログイン状態のユーザー向けリンク */}
            <Link to="/sales" className="mr-4 hover:text-gray-300">
              案件
            </Link>
            <Link to="/customers" className="mr-4 hover:text-gray-300">
              顧客
            </Link>
            <Link to="/tasks" className="mr-4 hover:text-gray-300">
              タスク
            </Link>
            <Link to="/contacts" className="mr-4 hover:text-gray-300">
              問い合わせ
            </Link>
            <Link to="/kanban" className="mr-4 hover:text-gray-300">
              Kanban
            </Link>
            <Link to="/profile" className="mr-4 hover:text-gray-300">
              プロフィール
            </Link>
            {isAdmin && (
              <Link to="/admin/users" className="hover:text-gray-300">
                ユーザー管理
              </Link>
            )}
          </>
        )}
      </div>

      {/* 右側: 通知とログアウトボタン */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative" ref={dropdownRef}>
            {/* 通知ベル */}
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-full hover:bg-gray-700 transition"
            >
              <FontAwesomeIcon icon={faBell} size="lg" />
              {/* 未読件数バッジ */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 通知ドロップダウン */}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                {/* NotificationList は Context からデータ取得するためプロップス不要 */}
                <NotificationList />
              </div>
            )}
          </div>
        )}

        {/* ログアウト or ログインボタン */}
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            ログアウト
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
          >
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
