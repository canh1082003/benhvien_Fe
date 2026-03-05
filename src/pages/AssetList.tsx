import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Wrench, AlertOctagon, Clock, Plus } from 'lucide-react';

import { assetsApi, departmentsApi, categoriesApi, type AssetFilters } from '../api';
import type { Asset, AssetCategory, Department, KPI } from '../types';
import AssetModal from '../components/AssetModal';

const STATUS_LABELS: Record<string, string> = {
  IN_SERVICE: 'Đang sử dụng',
  STANDBY: 'Dự phòng',
  UNDER_MAINTENANCE: 'Đang bảo trì',
  BREAKDOWN: 'Hỏng',
  OUT_OF_SERVICE: 'Ngừng sử dụng',
  DECOMMISSIONED: 'Đã thanh lý',
};

const STATUS_BADGE: Record<string, string> = {
  IN_SERVICE: 'green',
  STANDBY: 'blue',
  UNDER_MAINTENANCE: 'amber',
  BREAKDOWN: 'red',
  OUT_OF_SERVICE: 'gray',
  DECOMMISSIONED: 'gray',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_BADGE[status] ?? 'gray';
  return <span className={`badge badge-${color}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function InspectionBadge({ info }: { info: { status: string; text: string; badge: string } }) {
  if (!info || info.status === 'none') return <span className="badge badge-gray">Không YC</span>;
  const map: Record<string, string> = { 'b-green': 'green', 'b-blue': 'blue', 'b-amber': 'amber', 'b-red': 'red', '': 'gray' };
  return <span className={`badge badge-${map[info.badge] ?? 'gray'}`}>{info.text}</span>;
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (window as any).toggleAssetModal = (show: boolean) => setShowModal(show);
    return () => { (window as any).toggleAssetModal = undefined; };
  }, []);

  // base origin for links to server (admin page, troubleshooting hints)
  const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';

  const [filters, setFilters] = useState<AssetFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [assetRes, kpiRes] = await Promise.all([
        assetsApi.list(filters),
        assetsApi.kpi(),
      ]);
      setAssets(assetRes.data.results);
      setTotal(assetRes.data.count);
      setKpi(kpiRes.data);
    } catch (e) {
      setError(`Không thể tải dữ liệu. Kiểm tra Django server tại ${API_ORIGIN}.`);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    Promise.all([departmentsApi.list(), categoriesApi.list()]).then(([d, c]) => {
      setDepartments(d.data.results);
      setCategories(c.data.results);
    });
  }, []);

  const setQuick = (q: string) =>
    setFilters(f => ({ ...f, quick: f.quick === q ? '' : q, page: 1 }));

  const handleSearch = () => setFilters(f => ({ ...f, search: searchInput, page: 1 }));

  return (
    <div className="page-content">
      {/* KPI Grid */}
      {kpi && (
        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => setFilters({})}>
            <div className="kpi-label">Tổng thiết bị</div>
            <div className="kpi-value blue">{kpi.total}</div>
          </div>
          <div className="kpi-card" onClick={() => setFilters({ status: 'IN_SERVICE' })}>
            <div className="kpi-label">Đang sử dụng</div>
            <div className="kpi-value green">{kpi.in_service}</div>
          </div>
          <div className="kpi-card" onClick={() => setFilters({ status: 'STANDBY' })}>
            <div className="kpi-label">Dự phòng</div>
            <div className="kpi-value blue">{kpi.standby}</div>
          </div>
          <div className="kpi-card" onClick={() => setFilters({ status: 'BREAKDOWN' })}>
            <div className="kpi-label">Hỏng / Bảo trì</div>
            <div className="kpi-value red">{kpi.breakdown + kpi.under_maintenance}</div>
          </div>
        </div>
      )}

      {/* Quick filter chips */}
      {kpi && (
        <div className="quick-filters">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Lọc nhanh:</span>
          <button className={`chip chip-amber${filters.quick === 'pm_soon' ? ' active' : ''}`}
                  onClick={() => setQuick('pm_soon')}>
            <Wrench size={11}/> PM sắp đến ({kpi.pm_soon})
          </button>
          <button className={`chip chip-red${filters.quick === 'pm_overdue' ? ' active' : ''}`}
                  onClick={() => setQuick('pm_overdue')}>
            <Wrench size={11}/> PM quá hạn ({kpi.pm_overdue})
          </button>
          <button className={`chip chip-amber${filters.quick === 'inspection_soon' ? ' active' : ''}`}
                  onClick={() => setQuick('inspection_soon')}>
            <Clock size={11}/> KĐ sắp đến ({kpi.inspection_soon})
          </button>
          <button className={`chip chip-red${filters.quick === 'inspection_overdue' ? ' active' : ''}`}
                  onClick={() => setQuick('inspection_overdue')}>
            <AlertOctagon size={11}/> KĐ quá hạn ({kpi.inspection_overdue})
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={14} color="var(--text-muted)"/>
          <input
            value={searchInput} placeholder="Mã thiết bị / Tên / Serial / IMEI..."
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>Tìm</button>
        </div>
        <select className="filter-select" value={filters.status ?? ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="filter-select" value={filters.dept ?? ''} onChange={e => setFilters(f => ({ ...f, dept: e.target.value, page: 1 }))}>
          <option value="">Tất cả khoa/phòng</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="filter-select" value={filters.category ?? ''} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="">Tất cả nhóm</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({}); setSearchInput(''); }}>
          <RefreshCw size={13}/> Xóa lọc
        </button>
      </div>

      {/* Error */}
      {error && <div className="error-box" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading"><RefreshCw size={18} className="spin"/> &nbsp; Đang tải...</div>
        ) : assets.length === 0 ? (
          <div className="empty">
            <span style={{ fontSize: 32 }}>📦</span>
            <span>Không có thiết bị nào</span>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ marginTop: 8 }}
              onClick={() => setShowModal(true)}
            >
              <Plus size={14}/> Thêm thiết bị
            </button>
          </div>
        ) : (
          <table className="asset-table">
            <thead>
              <tr>
                <th>Mã thiết bị</th>
                <th>Tên thiết bị</th>
                <th>Nhóm thiết bị</th>
                <th>Khoa/Phòng</th>
                <th>Vị trí</th>
                <th>Kiểm định</th>
                <th>PM</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id}>
                  <td>
                    <Link to={`/assets/${a.id}`} className="asset-code-link">{a.asset_code}</Link>
                    {a.serial_no && <div className="asset-serial">S/N: {a.serial_no}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.asset_name}</div>
                    {a.manufacturer_name && <div className="asset-name">{a.manufacturer_name}</div>}
                  </td>
                  <td><span style={{ fontSize: 12 }}>{a.category_name || '—'}</span></td>
                  <td><span className="location-text">{a.owner_dept_name || '—'}</span></td>
                  <td>
                    <span className="location-text">
                      {[a.building, a.floor, a.room].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </td>
                  <td><InspectionBadge info={a.inspection_status}/></td>
                  <td><InspectionBadge info={a.pm_status}/></td>
                  <td><StatusBadge status={a.current_status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
      <div className="pagination">
        <span className="pagination-info">
          Hiển thị <b>{((filters.page || 1)-1)*20+1}</b> - <b>{Math.min((filters.page || 1)*20, total || 0)}</b> trong tổng số <b>{total || 0}</b>
        </span>
        <div className="pagination-btns">
          <button disabled={(filters.page || 1) === 1} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}><ChevronLeft size={16}/></button>
          <button disabled={((filters.page || 1) * 20) >= total} onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}><ChevronRight size={16}/></button>
        </div>
      </div>
      </div>

      {showModal && (
        <AssetModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
