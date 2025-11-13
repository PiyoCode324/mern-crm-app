import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authorizedRequest } from "../services/authService";
import Modal from "../components/Modal";
import SalesForm from "../components/SalesForm";
import ActivityTimeline from "../components/ActivityTimeline";

const SalesDetailPage = () => {
  const { saleId } = useParams(); // URLパラメータから案件IDを取得
  const navigate = useNavigate(); // 画面遷移用
  const { user, token } = useAuth(); // 認証済みユーザー情報とトークン
  const [sale, setSale] = useState(null); // 案件詳細
  const [customer, setCustomer] = useState(null); // 案件に紐づく顧客情報
  const [loading, setLoading] = useState(true); // 読み込み中フラグ
  const [showModal, setShowModal] = useState(false); // モーダル表示フラグ
  const [modalConfig, setModalConfig] = useState({}); // モーダル設定
  const [isEditing, setIsEditing] = useState(false); // 編集モードフラグ

  // 案件詳細情報を取得する関数
  const fetchSaleDetails = useCallback(async () => {
    if (!user || !token || !saleId) return;
    try {
      setLoading(true);
      const res = await authorizedRequest("GET", `/sales/${saleId}`);
      setSale(res.sales); // 案件情報をセット
      setCustomer(res.customer); // 顧客情報をセット
      // ✅ 案件に紐づくactivitiesはActivityTimelineコンポーネントが取得するためここでは不要
    } catch (err) {
      console.error("案件情報の取得に失敗しました:", err);
      const errorMessage =
        err.response?.status === 403
          ? "この案件を閲覧する権限がありません。"
          : "案件情報の取得に失敗しました。";
      // エラー時にモーダルを表示
      setModalConfig({
        title: "エラー",
        message: errorMessage,
        onConfirm: () => {
          setShowModal(false);
          navigate("/sales"); // 案件一覧に遷移
        },
        isConfirmOnly: true,
      });
      setShowModal(true);
      setSale(null);
    } finally {
      setLoading(false);
    }
  }, [user, token, saleId, navigate]);

  // コンポーネントマウント時に案件情報取得
  useEffect(() => {
    fetchSaleDetails();
  }, [fetchSaleDetails]);

  // 編集成功後に再取得
  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchSaleDetails();
  };

  // 削除確認モーダル表示
  const handleDelete = (id) => {
    setModalConfig({
      title: "削除確認",
      message: "本当にこの案件を削除しますか？",
      onConfirm: () => {
        confirmDelete(id);
        setShowModal(false);
      },
      onCancel: () => setShowModal(false),
      isConfirmOnly: false,
    });
    setShowModal(true);
  };

  // 削除処理
  const confirmDelete = async (id) => {
    if (!user || !token) {
      setModalConfig({
        title: "エラー",
        message: "ログインしてください",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
      return;
    }
    try {
      await authorizedRequest("DELETE", `/sales/${id}`);
      navigate("/sales"); // 削除後に案件一覧へ
    } catch (err) {
      console.error("削除エラー:", err);
      setModalConfig({
        title: "エラー",
        message: "案件の削除に失敗しました",
        onConfirm: () => setShowModal(false),
        isConfirmOnly: true,
      });
      setShowModal(true);
    }
  };

  // 読み込み中表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-700">読み込み中...</p>
      </div>
    );
  }

  // 案件が存在しない場合
  if (!sale) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-700">案件が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      {showModal && <Modal {...modalConfig} />}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">案件詳細</h1>

      {isEditing ? (
        <SalesForm
          editingSale={sale}
          onSuccess={handleEditSuccess}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <>
          {/* 案件情報カード */}
          <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">
                {sale?.dealName}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors duration-200"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(sale?._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                  削除
                </button>
              </div>
            </div>

            {/* 案件詳細情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
              <p>
                <span className="font-semibold">顧客:</span>{" "}
                {customer?.companyName || "情報なし"}
              </p>
              <p>
                <span className="font-semibold">金額:</span> ¥
                {sale?.amount?.toLocaleString() || "未設定"}
              </p>
              <p>
                <span className="font-semibold">ステータス:</span>{" "}
                {sale?.status}
              </p>
              <p>
                <span className="font-semibold">期限日:</span>{" "}
                {sale?.dueDate
                  ? new Date(sale.dueDate).toLocaleDateString()
                  : "未設定"}
              </p>
            </div>

            {/* メモ欄 */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">メモ</h3>
              <p className="whitespace-pre-wrap">{sale?.notes}</p>
            </div>
          </div>

          {/* アクティビティタイムライン */}
          <div className="max-w-4xl mx-auto">
            <ActivityTimeline
              type="sales"
              targetId={saleId}
              refreshKey={isEditing} // 編集後にリフレッシュ
            />
          </div>
        </>
      )}

      {/* 案件一覧に戻るボタン */}
      <div className="text-left mt-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/sales")}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          &larr; 案件一覧に戻る
        </button>
      </div>
    </div>
  );
};

export default SalesDetailPage;
