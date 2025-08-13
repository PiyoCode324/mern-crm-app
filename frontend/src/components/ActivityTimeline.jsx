// src/components/ActivityTimeline.jsx

import React, { useState, useEffect, useCallback } from "react";
import { authorizedRequest } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const ActivityTimeline = ({ customerId, refreshKey }) => {
  // アクティビティのステート管理
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ページネーションのステート
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 1ページあたりの表示件数を設定

  // AuthContextからユーザー情報とトークンを取得
  const { user, token } = useAuth();

  /**
   * APIからアクティビティ履歴を非同期で取得する関数
   */
  const fetchActivities = useCallback(async () => {
    // customerIdとtokenが両方存在しない場合は処理をスキップ
    if (!customerId || !token) {
      console.log(
        "アクティビティ取得スキップ：customerIdまたはトークンがありません。"
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // authorizedRequest関数にトークンを渡してAPIリクエストを実行
      const res = await authorizedRequest(
        "GET",
        `/activities/customer/${customerId}`,
        null,
        token
      );
      // updatedAtで降順ソート
      const sortedActivities = res.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setAllActivities(sortedActivities);
      setLoading(false);
    } catch (err) {
      console.error("アクティビティの取得エラー:", err);
      setError("アクティビティの取得に失敗しました。");
      setLoading(false);
    }
  }, [customerId, token]); // 依存配列にcustomerIdとtokenを追加

  // コンポーネントがマウントされた時、およびユーザーやトークン、customerId、refreshKeyの状態が変化した時に実行
  useEffect(() => {
    // ユーザーとトークンが存在する場合、およびcustomerIdが存在する場合のみデータ取得を開始
    if (user && token && customerId) {
      fetchActivities();
    }
  }, [fetchActivities, user, token, customerId, refreshKey]); // ここにrefreshKeyを追加

  // 現在のページに表示するアクティビティを計算
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = allActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);

  // ページ変更ハンドラ
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * タイムスタンプをフォーマットするヘルパー関数
   * 不正な日付の場合は代替テキストを返す
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    // 日付オブジェクトが有効かどうかをチェック
    if (!isNaN(date.getTime())) {
      return date.toLocaleString();
    }
    return "日付不明";
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="text-center mt-8 text-gray-600">
        アクティビティ履歴を読み込み中...
      </div>
    );
  }

  // エラー発生時の表示
  if (error) {
    return <div className="text-center mt-8 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md font-sans">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        アクティビティ履歴
      </h2>
      {currentActivities.length > 0 ? (
        <>
          <div className="space-y-4">
            {currentActivities.map((activity, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm text-gray-500">
                  {formatDate(activity.updatedAt)}
                </p>
                <p className="text-gray-800">
                  <strong className="font-medium">{activity.title}</strong>
                </p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
            ))}
          </div>
          {/* ページネーションコントロール */}
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
          この顧客に関連するアクティビティはありません。
        </p>
      )}
    </div>
  );
};

export default ActivityTimeline;
