// src/components/Customer/CustomerBarChart.jsx
// 顧客別の売上総額を横棒グラフで表示するコンポーネント
// Chart.js + react-chartjs-2 を使用

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Chart.js のコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CustomerBarChart = ({ data }) => {
  console.log("📊 CustomerBarChart data:", data);

  // Chart.js 用データ構造に変換
  const chartData = {
    labels: data.map((item) => item.name), // 顧客名
    datasets: [
      {
        label: "売上総額 (円)",
        data: data.map((item) => item.sales), // 売上額
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y", // 横向き棒グラフ
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "顧客別売上ランキング",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default CustomerBarChart;
