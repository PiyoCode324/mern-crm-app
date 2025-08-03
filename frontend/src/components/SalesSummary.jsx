// src/components/SalesSummary.jsx
import React, { useEffect, useState } from "react";
import { fetchSalesSummary } from "../utils/salesApi";

const SalesSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchSalesSummary();
        setSummary(data);
      } catch (err) {
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>売上サマリー</h2>
      <ul>
        <li>総売上: ¥{summary.totalSales}</li>
        <li>注文数: {summary.totalOrders} 件</li>
        <li>平均単価: ¥{summary.averageOrderValue}</li>
        {/* 必要に応じて他のフィールドも表示 */}
      </ul>
    </div>
  );
};

export default SalesSummary;
