// src/pages/CustomerPage.jsx

// CustomerList コンポーネントをインポート
// 顧客一覧の表示や、各顧客の詳細ページへのリンクなどのUIを担当
import CustomerList from "../components/CustomerList";

// CustomerPage コンポーネントを定義
// このページは顧客一覧ページとして機能する
const CustomerPage = () => {
  return (
    // ページ全体の余白を設定するdiv
    // Tailwind CSSの "p-6" によりパディングが追加される
    <div className="p-6">
      {/* CustomerList コンポーネントをレンダリング */}
      {/* 実際の顧客データ取得やリスト表示は CustomerList 側で実装 */}
      <CustomerList />
    </div>
  );
};

// CustomerPage コンポーネントをエクスポート
// 他のページやルーターから import して使用できるようにする
export default CustomerPage;
