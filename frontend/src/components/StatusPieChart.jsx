// src/components/StatusPieChart.jsx
// -----------------------------------------
// 案件ステータス別の円グラフコンポーネント
// ・react-chartjs-2 と chart.js を使用
// ・propsとして渡されたdataを基にグラフを描画
//   dataの形式例: [{ status: "見込み", count: 5 }, { status: "契約済", count: 3 }]
// -----------------------------------------

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Chart.jsに必要な要素を登録
ChartJS.register(ArcElement, Tooltip, Legend);

const StatusPieChart = ({ data }) => {
  // Chart.jsに渡すデータ構造を作成
  const chartData = {
    labels: data.map((item) => item.status),  // ステータス名をラベルに
    datasets: [
      {
        label: "案件数",                      // データセットのラベル
        data: data.map((item) => item.count), // ステータスごとの件数
        backgroundColor: [
          "#4299E1", // 青
          "#48BB78", // 緑
          "#ECC94B", // 黄
          "#F56565", // 赤
          "#A0AEC0", // 灰色
        ],
        hoverBackgroundColor: [
          "#63B3ED",
          "#68D391",
          "#F6E05E",
          "#F68787",
          "#CBD5E0",
        ],
        borderWidth: 1, // 枠線の太さ
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-center mb-4">
        案件ステータス別案件数
      </h2>
      <Pie data={chartData} />
    </div>
  );
};

export default StatusPieChart;
