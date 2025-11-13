// components/LoadingSpinner.jsx
// -----------------------------------------
// ローディング中を示すスピナーコンポーネント
// 中央揃えで表示し、TailwindCSSのアニメーションで回転
// -----------------------------------------

import React from "react";

const LoadingSpinner = () => {
  return (
    // スピナーコンテナ: 横中央・縦中央に配置
    <div className="flex justify-center items-center">
      {/* 回転する丸いスピナー */}
      <div
        className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
        role="status" // アクセシビリティ用に状態として認識される
      >
        {/* 画面リーダー向けテキスト */}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
