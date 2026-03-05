import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Plus, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Danh sách Thiết bị Y tế',
  '/assets/add': 'Nhập mới thiết bị',
};

export default function Layout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname === k)?.[1]
    ?? (pathname.startsWith('/assets/') ? 'Chi tiết thiết bị' : 'Quản lý Thiết bị Y tế');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <Sidebar/>
      <div className="main">
        <header className="topbar">
          <span className="topbar-title">📋 {title}</span>
          <div className="topbar-actions">
            {pathname === '/' && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => (window as any).toggleAssetModal?.(true)}
              >
                <Plus size={14}/> Thêm thiết bị
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout} title="Đăng xuất">
              <LogOut size={14}/>
            </button>
          </div>
        </header>
        <Outlet/>
      </div>
    </div>
  );
}
