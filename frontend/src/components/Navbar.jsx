// components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold mr-6">
          CRM App
        </Link>
        {user && (
          <>
            {/* ログインユーザー向けのリンク */}
            <Link to="/sales" className="mr-4 hover:text-gray-300">
              案件
            </Link>
            <Link to="/customers" className="mr-4 hover:text-gray-300">
              顧客
            </Link>
            <Link to="/contacts" className="mr-4 hover:text-gray-300">
              担当者
            </Link>
            <Link to="/tasks" className="mr-4 hover:text-gray-300">
              タスク
            </Link>
            {/* ✅ Kanbanボードへのリンクを追加 */}
            <Link to="/kanban" className="mr-4 hover:text-gray-300">
              Kanban
            </Link>
            <Link to="/profile" className="mr-4 hover:text-gray-300">
              プロフィール
            </Link>
            {/* ✅ 管理者向けのリンク */}
            {isAdmin && (
              <Link to="/admin/users" className="hover:text-gray-300">
                ユーザー管理
              </Link>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            ログアウト
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
          >
            ログイン
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
