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
            <Link to="/profile" className="mr-4 hover:text-gray-300">
              プロフィール
            </Link>
            {/* ✅ isAdminがtrueの場合のみ表示 */}
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
