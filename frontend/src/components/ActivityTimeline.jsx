// src/components/ActivityTimeline.jsx (デバッグ版)

import React, { useState, useEffect, useCallback } from "react";
import { authorizedRequest } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const ActivityTimeline = ({ type, targetId, refreshKey }) => {
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { user, token } = useAuth();

  const fetchActivities = useCallback(async () => {
    console.log("=== fetchActivities START ===");
    console.log("type:", type, "targetId:", targetId, "token:", token);

    if (!type || !targetId || !token) {
      console.warn("アクティビティ取得スキップ：必要な情報が不足");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = `/activities/${type}/${targetId}`;
      console.log("APIエンドポイント:", endpoint);

      const res = await authorizedRequest("GET", endpoint, null, token);
      console.log("APIレスポンス:", res);

      let activitiesArray = [];
      if (Array.isArray(res)) {
        activitiesArray = res;
      } else if (res && Array.isArray(res.data)) {
        activitiesArray = res.data;
      } else {
        console.warn("レスポンスが配列ではありません:", res);
      }

      console.log("activitiesArray:", activitiesArray);

      const sortedActivities = activitiesArray.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      console.log("ソート後のactivities:", sortedActivities);

      setAllActivities(sortedActivities);
    } catch (err) {
      console.error("アクティビティの取得エラー:", err);
      setError("アクティビティの取得に失敗しました。");
    } finally {
      setLoading(false);
      console.log("=== fetchActivities END ===");
    }
  }, [type, targetId, token]);

  useEffect(() => {
    console.log("=== useEffect発火 ===", {
      user,
      token,
      type,
      targetId,
      refreshKey,
    });
    if (user && token && type && targetId) {
      fetchActivities();
    } else {
      console.warn("必要な情報が揃っていないためfetchActivities未実行");
    }
  }, [fetchActivities, user, token, type, targetId, refreshKey]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = allActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(allActivities.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) ? date.toLocaleString() : "日付不明";
  };

  if (loading) {
    return (
      <div className="text-center mt-8 text-gray-600">
        アクティビティ履歴を読み込み中...
      </div>
    );
  }

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
