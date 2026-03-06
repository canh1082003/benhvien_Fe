import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, Package, Users 
} from 'lucide-react';
import { api } from '../api';

interface KPI {
  total: number;
  in_service: number;
  standby: number;
  under_maintenance: number;
  breakdown: number;
  out_of_service: number;
  inspection_overdue: number;
  pm_overdue: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

export default function AdminDashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get('assets/kpi/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKpi(res.data);
      } catch (err) {
        console.error('Failed to fetch KPI', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPI();
  }, []);

  if (loading || !kpi) {
    return <div className="loading">Đang tải dữ liệu dashboard...</div>;
  }

  const chartData = [
    { name: 'Đang hoạt động', value: kpi.in_service },
    { name: 'Dự phòng', value: kpi.standby },
    { name: 'Đang sửa chữa', value: kpi.under_maintenance },
    { name: 'Hỏng (Breakdown)', value: kpi.breakdown },
    { name: 'Ngừng hoạt động', value: kpi.out_of_service },
  ];

  const statusPieData = [
    { name: 'Tốt', value: kpi.in_service + kpi.standby },
    { name: 'Lỗi/Hỏng', value: kpi.breakdown + kpi.under_maintenance },
    { name: 'Quá hạn kiểm định', value: kpi.inspection_overdue },
  ];

  return (
    <div className="admin-dashboard fade-in">
      <header className="page-header">
        <div>
          <h1>Bảng điều khiển Quản trị</h1>
          <p className="subtitle">Tổng quan hệ thống và trạng thái thiết bị</p>
        </div>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><Package size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng thiết bị</span>
            <span className="kpi-value">{kpi.total}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><CheckCircle size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Sẵn sàng</span>
            <span className="kpi-value">{kpi.in_service}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><Clock size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Bảo trì/Sửa chữa</span>
            <span className="kpi-value">{kpi.under_maintenance}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Hỏng hóc</span>
            <span className="kpi-value">{kpi.breakdown}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Phân bổ Trạng thái Thiết bị</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <h3>Tỷ lệ Tình trạng</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section-card">
          <div className="section-icon"><Users size={20} /></div>
          <div className="section-content">
            <h4>Quản lý người dùng</h4>
            <p>Phân quyền và quản lý tài khoản nhân viên</p>
            <button className="btn btn-secondary btn-sm mt-10">Quản lý ngay</button>
          </div>
        </div>
        <div className="dashboard-section-card">
          <div className="section-icon"><Activity size={20} /></div>
          <div className="section-content">
            <h4>Nhật ký hệ thống</h4>
            <p>Theo dõi các thay đổi và thao tác trên hệ thống</p>
            <button className="btn btn-secondary btn-sm mt-10">Xem log</button>
          </div>
        </div>
      </div>
    </div>
  );
}
