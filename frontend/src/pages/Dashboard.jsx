// src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";

const Dashboard = () => {
  // ✅ useAuthフックからisAuthReadyの状態を取得
  const { user, isAuthReady } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      // ✅ 認証準備が完了し、ユーザーが存在する場合のみAPIを呼び出す
      if (!user || !isAuthReady) {
        setLoading(false);
        return;
      }

      try {
        const data = await authorizedRequest("GET", "/sales/summary");
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error("サマリーデータの取得に失敗しました:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user, isAuthReady]); // ✅ 依存配列にisAuthReadyを追加

  if (loading) {
    return <div className="text-center mt-8">読み込み中...</div>;
  }
  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }
  if (!summary) {
    return <div className="text-center mt-8">サマリーデータがありません。</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">総売上</h2>
          <p className="text-4xl font-bold text-blue-600">
            ¥{summary.totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">総案件数</h2>
          <p className="text-4xl font-bold text-green-600">
            {summary.totalDeals} 件
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            平均案件金額
          </h2>
          <p className="text-4xl font-bold text-purple-600">
            ¥{Math.round(summary.averageDealValue).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
