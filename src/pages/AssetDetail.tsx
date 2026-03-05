import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, RefreshCw } from 'lucide-react';

import { assetsApi } from '../api';
import type { Asset } from '../types';

const STATUS_LABELS: Record<string, string> = {
  IN_SERVICE: 'Đang sử dụng', STANDBY: 'Dự phòng',
  UNDER_MAINTENANCE: 'Đang bảo trì', BREAKDOWN: 'Hỏng',
  OUT_OF_SERVICE: 'Ngừng sử dụng', DECOMMISSIONED: 'Đã thanh lý',
};
const STATUS_BADGE: Record<string, string> = {
  IN_SERVICE: 'green', STANDBY: 'blue', UNDER_MAINTENANCE: 'amber',
  BREAKDOWN: 'red', OUT_OF_SERVICE: 'gray', DECOMMISSIONED: 'gray',
};

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value ?? '—'}</span>
    </div>
  );
}

function BadgeFromInfo({ info }: { info?: { status: string; text: string; badge: string } }) {
  if (!info || info.status === 'none') return <span className="badge badge-gray">Không yêu cầu</span>;
  const map: Record<string, string> = { 'b-green': 'green', 'b-blue': 'blue', 'b-amber': 'amber', 'b-red': 'red', '': 'gray' };
  return <span className={`badge badge-${map[info.badge] ?? 'gray'}`}>{info.text}</span>;
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    assetsApi.get(Number(id))
      .then(r => setAsset(r.data))
      .catch(() => setError('Không tìm thấy thiết bị này.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-content"><div className="loading"><RefreshCw size={18}/> &nbsp; Đang tải...</div></div>;
  if (error) return <div className="page-content"><div className="error-box">{error}</div></div>;
  if (!asset) return null;

  const badgeColor = STATUS_BADGE[asset.current_status] ?? 'gray';

  return (
    <div className="page-content">
      {/* Header */}
      <div className="detail-header">
        <div>
          <div className="detail-code">{asset.asset_code}</div>
          <div className="detail-name">{asset.asset_name}</div>
          <div className="detail-meta">
            {asset.serial_no && <span>S/N: {asset.serial_no}</span>}
            {asset.owner_dept_name && <span>📍 {asset.owner_dept_name}</span>}
            {asset.manufacturer_name && <span>🏭 {asset.manufacturer_name}</span>}
            <span><span className={`badge badge-${badgeColor}`}>{STATUS_LABELS[asset.current_status] ?? asset.current_status}</span></span>
          </div>
        </div>
        <div className="detail-actions">
          <Link to="/" className="topbar-btn secondary"><ArrowLeft size={14}/> Quay lại</Link>
          <button className="topbar-btn secondary"><Edit size={14}/> Chỉnh sửa</button>
        </div>
      </div>

      {/* Status KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Kiểm định', info: asset.inspection_status },
          { label: 'Bảo trì (PM)', info: asset.pm_status },
          { label: 'Vòng đời (EOL)', info: asset.eol_status },
        ].map(({ label, info }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div style={{ marginTop: 8 }}><BadgeFromInfo info={info}/></div>
          </div>
        ))}
      </div>

      {/* Info Grid */}
      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Identification */}
          <div className="info-card">
            <div className="info-card-header">1. Thông tin nhận diện</div>
            <InfoRow label="Mã thiết bị" value={asset.asset_code}/>
            <InfoRow label="Tên thiết bị" value={asset.asset_name}/>
            <InfoRow label="Serial Number" value={asset.serial_no}/>
            <InfoRow label="Model (tay)" value={asset.model_name_manual}/>
            <InfoRow label="Barcode/QR" value={asset.barcode}/>
            <InfoRow label="IMEI" value={asset.imei}/>
          </div>

          {/* Classification */}
          <div className="info-card">
            <div className="info-card-header">2. Phân loại & Kỹ thuật</div>
            <InfoRow label="Nhóm thiết bị" value={asset.category_name}/>
            <InfoRow label="Nhà sản xuất" value={asset.manufacturer_name}/>
            <InfoRow label="Nhà cung cấp" value={(asset.vendor as any)?.name}/>
            <InfoRow label="Risk Class" value={asset.risk_class}/>
            <InfoRow label="Mức độ ưu tiên" value={asset.criticality}/>
          </div>

          {/* Maintenance */}
          <div className="info-card">
            <div className="info-card-header">3. Bảo trì & Kiểm định</div>
            <InfoRow label="PM - Last" value={fmtDate((asset as any).pm_last_date)}/>
            <InfoRow label="PM - Next" value={fmtDate(asset.pm_next_due_date)}/>
            <InfoRow label="KĐ - Last" value={fmtDate((asset as any).inspection_last_date)}/>
            <InfoRow label="KĐ - Hết hạn" value={fmtDate(asset.inspection_expiry_date)}/>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Location */}
          <div className="info-card">
            <div className="info-card-header">Vị trí</div>
            <InfoRow label="Khoa/Phòng" value={asset.owner_dept_name}/>
            <InfoRow label="Tòa nhà" value={asset.building}/>
            <InfoRow label="Tầng" value={asset.floor}/>
            <InfoRow label="Phòng" value={asset.room}/>
          </div>

          {/* Lifecycle */}
          <div className="info-card">
            <div className="info-card-header">Vòng đời</div>
            <InfoRow label="Ngày đưa vào SD" value={fmtDate(asset.commissioned_at)}/>
            <InfoRow label="Tuổi thọ (năm)" value={asset.useful_life_years}/>
            <InfoRow label="Ngày mua" value={fmtDate(asset.purchase_at)}/>
            <InfoRow label="Bảo hành đến" value={fmtDate(asset.warranty_end_at)}/>
            <InfoRow label="Giá mua" value={(asset as any).purchase_price ? `${Number((asset as any).purchase_price).toLocaleString('vi-VN')} đ` : undefined}/>
          </div>

          {/* Note */}
          {asset.notes && (
            <div className="info-card">
              <div className="info-card-header">Ghi chú</div>
              <div style={{ padding: '12px 18px', fontSize: 13 }}>{asset.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
