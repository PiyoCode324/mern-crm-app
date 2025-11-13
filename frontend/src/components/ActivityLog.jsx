// src/components/ActivityLog.jsx

import React, { useState, useEffect, useCallback } from "react";
import { authorizedRequest } from "../services/authService"; // 認証付きリクエスト関数
import { useAuth } from "../context/AuthContext"; // ユーザー認証情報を提供するコンテキスト

const ActivityLog = () => {
  // 🔹 アクティビティ（全件）を保持するステート
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState(null); // エラーメッセージを保持

  // 🔹 ページネーション用のステート
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const itemsPerPage = 10; // 1ページあたりの表示件数

  // 🔹 認証情報を取得（管理者かどうか、トークンなど）
  const { user, token, isAdmin } = useAuth();

  /**
   * 🔹 APIからアクティビティ履歴を全件取得する関数
   * useCallbackでメモ化し、依存関係が変わった時のみ再生成される
   */
  const fetchAllActivities = useCallback(async () => {
    if (!isAdmin || !token) {
      // 管理者以外は取得を許可しない
      console.log(
        "アクティビティログ取得スキップ：管理者権限またはトークンがありません。"
      );
      setLoading(false);
      setError("管理者権限が必要です。");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // バックエンドは全件返す想定（ページネーションはフロント側で実装）
      const res = await authorizedRequest(
        "GET",
        `/activities/all`,
        null,
        token
      );

      // 🔹 レスポンスが配列かどうか確認
      if (Array.isArray(res)) {
        // 更新日時 (updatedAt) で降順にソート
        const sortedActivities = res.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setAllActivities(sortedActivities);
      } else {
        // 想定外のレスポンス形式
        console.error("APIレスポンスの形式が不正です:", res);
        setError("アクティビティのデータ形式に問題があります。");
      }
      setLoading(false);
    } catch (err) {
      // 🔹 エラーハンドリング
      console.error("アクティビティの取得エラー:", err);
      setError("アクティビティの取得に失敗しました。");
      setLoading(false);
    }
  }, [isAdmin, token]);

  // 🔹 コンポーネント初期表示時や認証情報が変化した時にアクティビティを取得
  useEffect(() => {
    if (isAdmin && token) {
      fetchAllActivities();
    }
  }, [fetchAllActivities, isAdmin, token]);

  // 🔹 現在のページに表示するデータを計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = allActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);

  // 🔹 ページ切り替え関数
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * 🔹 日付フォーマット関数
   * タイムスタンプをローカル日時文字列に変換
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString(); // ローカルの日時フォーマット
    }
    return "日付不明"; // 無効な日付の場合
  };

  // 🔹 ローディング中の表示
  if (loading) {
    return (
      <div className="text-center mt-8 text-gray-600">
        全てのアクティビティ履歴を読み込み中...
      </div>
    );
  }

  // 🔹 エラー発生時の表示
  if (error) {
    return <div className="text-center mt-8 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md font-sans max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        アクティビティログ (全活動履歴)
      </h2>

      {/* 🔹 アクティビティが存在する場合 */}
      {currentActivities.length > 0 ? (
        <>
          <div className="space-y-4">
            {currentActivities.map((activity, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                {/* 更新日時 */}
                <p className="text-xs text-gray-500">
                  {formatDate(activity.updatedAt)}
                </p>
                {/* アクティビティ内容 */}
                <p className="text-gray-800 font-medium">
                  {activity.description}
                </p>
                {/* 関連ユーザー */}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">ユーザーID:</span>{" "}
                  {activity.userId}
                </p>
                {/* 対象となるモデルとID */}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">対象モデル:</span>{" "}
                  {activity.targetModel} ({activity.targetId})
                </p>
              </div>
            ))}
          </div>

          {/* 🔹 ページネーションコントロール */}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="text-gray-700">
              ページ {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        </>
      ) : (
        // 🔹 アクティビティが存在しない場合
        <p className="text-gray-500">アクティビティ履歴はありません。</p>
      )}
    </div>
  );
};

export default ActivityLog;
