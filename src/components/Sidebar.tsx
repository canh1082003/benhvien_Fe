import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Plus, Wrench, AlertCircle, CheckSquare,
  Package, Archive, Grid, Building2, Factory, Truck, Settings
} from 'lucide-react';

// server origin for admin link and hints; override with VITE_API_ORIGIN
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';

interface NavItem {
  to?: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

const navItems: NavSection[] = [
  { group: 'Thiết bị Y tế', items: [
    { to: '/', icon: <LayoutDashboard size={15}/>, label: 'Danh sách thiết bị', exact: true },
    { 
      onClick: () => (window as any).toggleAssetModal?.(true), 
      icon: <Plus size={15}/>, 
      label: 'Nhập mới thiết bị' 
    },
  ]},
  { group: 'Bảo trì & Kiểm định', items: [
    { icon: <Wrench size={15}/>, label: 'Work Orders' },
    { icon: <AlertCircle size={15}/>, label: 'Sự cố / Báo hỏng' },
    { icon: <CheckSquare size={15}/>, label: 'Kiểm định / Hiệu chuẩn' },
  ]},
  { group: 'Kho & Vật tư', items: [
    { icon: <Package size={15}/>, label: 'Linh kiện / Vật tư' },
    { icon: <Archive size={15}/>, label: 'Tồn kho' },
  ]},
  { group: 'Danh mục', items: [
    { icon: <Grid size={15}/>, label: 'Nhóm thiết bị' },
    { icon: <Building2 size={15}/>, label: 'Khoa/Phòng' },
    { icon: <Factory size={15}/>, label: 'Nhà sản xuất' },
    { icon: <Truck size={15}/>, label: 'Nhà cung cấp' },
  ]},
  { group: 'Hệ thống', items: [
    { 
      icon: <Settings size={15}/>, 
      label: 'Quản trị (Admin)', 
      to: '/admin'
    },
  ]},
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏥</div>
        <div>
          <div className="sidebar-logo-text">Bệnh Viện</div>
          <div className="sidebar-logo-sub">Asset Management</div>
        </div>
      </div>

      {navItems.map(section => (
        <div key={section.group}>
          <div className="sidebar-section-label">{section.group}</div>
          {section.items.map(item => {
            const isActive = item.to
              ? (item.exact ? pathname === item.to : pathname.startsWith(item.to))
              : false;

            if (item.onClick) {
              return (
                <div key={item.label} onClick={item.onClick}
                   className={`sidebar-item${isActive ? ' active' : ''}`}>
                  {item.icon}{item.label}
                </div>
              );
            }
            if (item.href) {
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
                   className={`sidebar-item${isActive ? ' active' : ''}`}>
                  {item.icon}{item.label}
                </a>
              );
            }
            if (item.to) {
              return (
                <Link key={item.label} to={item.to}
                      className={`sidebar-item${isActive ? ' active' : ''}`}>
                  {item.icon}{item.label}
                </Link>
              );
            }
            return (
              <div key={item.label} className="sidebar-item" style={{ opacity: .5 }}>
                {item.icon}{item.label}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px', fontSize: '10px', color: '#334155' }}>
        Phiên bản 1.0 · 2026
      </div>
    </aside>
  );
}
