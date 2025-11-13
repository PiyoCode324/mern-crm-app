// src/components/Activity/ActivityTimeline.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext"; // 認証情報を取得するコンテキスト
import { getTaskActivities } from "../utils/taskApi"; // タスク関連のアクティビティ取得API
import {
  getCustomerActivities,
  getSalesActivities,
} from "../utils/activityApi"; // 顧客・営業関連アクティビティ取得API

/**
 * ActivityTimeline コンポーネント
 * 特定の対象 (タスク・顧客・営業) に関連するアクティビティ履歴を時系列で表示する
 *
 * @param {string} type - アクティビティの種類 ("task" | "customer" | "sales")
 * @param {string} targetId - 関連する対象のID
 * @param {number} refreshKey - 更新トリガー用のキー（親コンポーネントから渡される）
 */
const ActivityTimeline = ({ type, targetId, refreshKey }) => {
  // アクティビティのステート
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ページネーションのステート
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 1ページあたりの表示件数

  // ユーザー情報とトークンを認証コンテキストから取得
  const { user, token } = useAuth();

  /**
   * APIから対象のアクティビティを取得する関数
   */
  const fetchActivities = useCallback(async () => {
    if (!type || !targetId) return;

    setLoading(true);
    setError(null);

    try {
      let res = [];

      // type に応じて呼び出すAPIを切り替え
      if (type === "task") {
        res = await getTaskActivities(targetId);
      } else if (type === "customer") {
        res = await getCustomerActivities(targetId);
      } else if (type === "sales") {
        res = await getSalesActivities(targetId);
      } else {
        console.warn("未対応の type:", type);
        res = [];
      }

      // updatedAt を基準に降順ソート
      const sorted = res.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setActivities(sorted);
    } catch (err) {
      console.error("アクティビティ取得エラー:", err);
      setError("アクティビティの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [type, targetId]);

  // 認証状態や対象が変化したとき、また refreshKey が変わったときに再取得
  useEffect(() => {
    if (user && type && targetId) {
      fetchActivities();
    }
  }, [user, type, targetId, refreshKey, fetchActivities]);

  // ページネーション用に表示対象を計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = activities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activities.length / itemsPerPage);

  // ページ移動処理
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // 日付をローカル形式に変換するヘルパー関数
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) ? date.toLocaleString() : "日付不明";
  };

  // --- 表示処理 ---
  if (loading)
    return (
      <p className="text-center mt-8 text-gray-600">
        アクティビティ履歴を読み込み中...
      </p>
    );
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md font-sans">
      {/* タイトル */}
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        アクティビティ履歴
      </h2>

      {/* アクティビティリスト */}
      {currentActivities.length > 0 ? (
        <>
          <div className="space-y-4">
            {currentActivities.map((activity, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                {/* 日付 */}
                <p className="text-sm text-gray-500">
                  {formatDate(activity.updatedAt)}
                </p>
                {/* タイトル */}
                <p className="text-gray-800">
                  <strong className="font-medium">{activity.title}</strong>
                </p>
                {/* 詳細 */}
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            ))}
          </div>

          {/* ページネーション */}
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
        <p className="text-gray-500">
          この項目に関連するアクティビティはありません。
        </p>
      )}
    </div>
  );
};

export default ActivityTimeline;
